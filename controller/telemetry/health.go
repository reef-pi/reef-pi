package telemetry

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/v4/mem"

	"github.com/shirou/gopsutil/v4/host"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const HealthStatsKey = "health_stats"

type HealthChecker interface {
	Check()
	Start()
	Stop()
	GetStats(http.ResponseWriter, *http.Request)
}

type hc struct {
	stopCh        chan struct{}
	interval      time.Duration
	t             Telemetry
	Notify        settings.HealthCheckNotify
	store         storage.Store
	statsMgr      StatsManager
	isRaspberryPi bool
}

type HealthMetric struct {
	Load5        float64  `json:"cpu"`
	UsedMemory   float64  `json:"memory"`
	CPUTemp      float64  `json:"cpu_temp"`
	Time         TeleTime `json:"time"`
	len          int
	loadSum      float64
	memorySum    float64
	cpuTempSum   float64
	UnderVoltage float64 `json:"throttle"`
}

func (m1 HealthMetric) Rollup(mx Metric) (Metric, bool) {
	m2 := mx.(HealthMetric)
	if m1.Time.Hour() == m2.Time.Hour() {
		m := HealthMetric{
			Time:         m1.Time,
			Load5:        m1.Load5,
			UsedMemory:   m1.UsedMemory,
			CPUTemp:      m1.CPUTemp,
			len:          m1.len,
			loadSum:      m1.loadSum,
			memorySum:    m1.memorySum,
			cpuTempSum:   m1.cpuTempSum,
			UnderVoltage: m2.UnderVoltage,
		}
		m.loadSum += m2.Load5
		m.memorySum += m2.UsedMemory
		m.cpuTempSum += m2.CPUTemp
		m.len += 1
		m.Load5 = utils.RoundToTwoDecimal(m.loadSum / float64(m.len))
		m.UsedMemory = utils.RoundToTwoDecimal(m.memorySum / float64(m.len))
		m.CPUTemp = utils.RoundToTwoDecimal(m.cpuTempSum / float64(m.len))
		if m.UnderVoltage == 0 {
			m.UnderVoltage = m2.UnderVoltage
		}
		return m, false
	}
	return m2, true
}

func (m1 HealthMetric) Before(mx Metric) bool {
	m2 := mx.(HealthMetric)
	return m1.Time.Before(m2.Time)
}

func NewHealthChecker(b string, i time.Duration, notify settings.HealthCheckNotify, t Telemetry, store storage.Store) HealthChecker {
	h := &hc{
		interval: i,
		stopCh:   make(chan struct{}),
		t:        t,
		Notify:   notify,
		statsMgr: t.NewStatsManager(b),
		store:    store,
	}
	stats, err := host.Info()
	if err == nil && strings.HasPrefix(stats.KernelArch, "arm") {
		h.isRaspberryPi = true
	}
	return h
}

func readCPUTemp() (float64, error) {
	data, err := os.ReadFile("/sys/class/thermal/thermal_zone0/temp")
	if err != nil {
		return 0, err
	}
	millideg, err := strconv.ParseFloat(strings.TrimSpace(string(data)), 64)
	if err != nil {
		return 0, err
	}
	return utils.RoundToTwoDecimal(millideg / 1000.0), nil
}

func (h *hc) Check() {
	loadStat, err := load.Avg()
	if err != nil {
		log.Println("ERROR: Failed to obtain load average. Error:", err)
		return
	}
	h.t.EmitMetric("system", "load5", loadStat.Load5)

	vmStat, err := mem.VirtualMemory()
	if err != nil {
		log.Println("ERROR: Failed to obtain memory stats. Error:", err)
		return
	}
	usedMemory := (math.Floor(vmStat.UsedPercent * 100)) / 100.0
	metric := HealthMetric{
		Load5:      loadStat.Load5,
		UsedMemory: usedMemory,
		len:        1,
		loadSum:    loadStat.Load5,
		memorySum:  usedMemory,
		Time:       TeleTime(time.Now()),
	}

	cpuTemp, err := readCPUTemp()
	if err != nil {
		log.Println("WARNING: Failed to read CPU temperature. Error:", err)
	} else {
		metric.CPUTemp = cpuTemp
		metric.cpuTempSum = cpuTemp
		h.t.EmitMetric("system", "cpu-temp", cpuTemp)
	}

	if h.isRaspberryPi {
		throttles, err := VcgencmdGetThrottled()
		if err != nil {
			log.Println("ERROR: failed to get pi power throttle information. Error:", err)
		} else {
			for _, throttle := range throttles {
				if throttle == UnderVoltage || throttle == UnderVoltageHasOccurred {
					metric.UnderVoltage = 1
					h.t.LogError("health-check", "under voltage detected")
				}
			}
		}
	}

	h.t.EmitMetric("system", "mem-used", usedMemory)
	h.t.EmitMetric("system", "under-voltage", metric.UnderVoltage)
	log.Println("health check: Used memory:", usedMemory, " Load5:", loadStat.Load5, " CPUTemp:", metric.CPUTemp)
	h.statsMgr.Update(HealthStatsKey, metric)
	h.NotifyIfNeeded(usedMemory, loadStat.Load5, metric.CPUTemp)
}

func (h *hc) NotifyIfNeeded(memory, load, cpuTemp float64) {
	if h.Notify.Enable {
		if load >= h.Notify.MaxCPU {
			subject := "CPU Load is high"
			format := "Current cpu load is %f is above threshold ( %f )"
			body := fmt.Sprintf(format, load, h.Notify.MaxCPU)
			h.t.Alert(subject, body)
		}
		if memory >= h.Notify.MaxMemory {
			subject := "Memory consumption is high"
			format := "Current memory consumption %f is above threshold ( %f )"
			body := fmt.Sprintf(format, memory, h.Notify.MaxMemory)
			h.t.Alert(subject, body)
		}
		if h.Notify.MaxCPUTemp > 0 && cpuTemp >= h.Notify.MaxCPUTemp {
			subject := "CPU temperature is high"
			format := "Current CPU temperature %f°C is above threshold ( %f°C )"
			body := fmt.Sprintf(format, cpuTemp, h.Notify.MaxCPUTemp)
			h.t.Alert(subject, body)
		}
	}
}

func (h *hc) Stop() {
	log.Println("Stopping health checker")
	h.stopCh <- struct{}{}
	if err := h.statsMgr.Save(HealthStatsKey); err != nil {
		log.Println("ERROR: health checker. Failed to save usage. Error:", err)
	}
}

func (h *hc) setup() {
	h.t.CreateFeedIfNotExist("system-load5")
	h.t.CreateFeedIfNotExist("system-mem-used")
	h.t.CreateFeedIfNotExist("system-under-voltage")
	h.t.CreateFeedIfNotExist("system-cpu-temp")
}

func (h *hc) Start() {
	h.setup()
	fn := func(d json.RawMessage) interface{} {
		u := HealthMetric{}
		json.Unmarshal(d, &u)
		return u
	}
	if err := h.statsMgr.Load(HealthStatsKey, fn); err != nil {
		log.Println("ERROR: health checker. Failed to load usage. Error:", err)
	}
	log.Println("Starting health checker")
	metric := HealthMetric{
		len:  1,
		Time: TeleTime(time.Now()),
	}
	h.statsMgr.Update(HealthStatsKey, metric)
	ticker := time.NewTicker(h.interval)
	for {
		select {
		case <-ticker.C:
			h.Check()
		case <-h.stopCh:
			ticker.Stop()
			return
		}
	}
}

func (h *hc) GetStats(res http.ResponseWriter, req *http.Request) {
	fn := func(id string) (interface{}, error) { return h.statsMgr.Get(HealthStatsKey) }
	utils.JSONGetResponse(fn, res, req)
}
