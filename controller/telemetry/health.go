package telemetry

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"
	"time"

	cron "github.com/robfig/cron/v3"
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
	reporter      *cron.Cron
	lastMetric    HealthMetric
}

type HealthMetric struct {
	Load5        float64  `json:"cpu"`
	UsedMemory   float64  `json:"memory"`
	Time         TeleTime `json:"time"`
	len          int
	loadSum      float64
	memorySum    float64
	UnderVoltage float64 `json:"throttle"`
}

func (m1 HealthMetric) Rollup(mx Metric) (Metric, bool) {
	m2 := mx.(HealthMetric)
	if m1.Time.Hour() == m2.Time.Hour() {
		m := HealthMetric{
			Time:         m1.Time,
			Load5:        m1.Load5,
			UsedMemory:   m1.UsedMemory,
			len:          m1.len,
			loadSum:      m1.loadSum,
			memorySum:    m1.memorySum,
			UnderVoltage: m2.UnderVoltage,
		}
		m.loadSum += m2.Load5
		m.memorySum += m2.UsedMemory
		m.len += 1
		m.Load5 = utils.RoundToTwoDecimal(m.loadSum / float64(m.len))
		m.UsedMemory = utils.RoundToTwoDecimal(m.memorySum / float64(m.len))
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
	log.Println("health check: Used memory:", usedMemory, " Load5:", loadStat.Load5)
	h.statsMgr.Update(HealthStatsKey, metric)
	h.lastMetric = metric
	h.NotifyIfNeeded(usedMemory, loadStat.Load5)
}

func (h *hc) NotifyIfNeeded(memory, load float64) {
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
	}
}

func (h *hc) sendReport() {
	m := h.lastMetric
	subject := fmt.Sprintf("[reef-pi] Status Report - %s", time.Now().Format("Jan 2 15:04"))
	body := fmt.Sprintf(
		"reef-pi Status Report\n\nCPU Load (5m avg): %.2f\nMemory used: %.2f%%\nUnder-voltage events: %.0f\nTime: %s",
		m.Load5, m.UsedMemory, m.UnderVoltage, time.Now().Format(time.RFC1123),
	)
	if _, err := h.t.Mail(subject, body); err != nil {
		log.Println("ERROR: health checker: failed to send status report:", err)
	} else {
		log.Println("health checker: status report sent")
	}
}

func (h *hc) Stop() {
	log.Println("Stopping health checker")
	if h.reporter != nil {
		h.reporter.Stop()
	}
	h.stopCh <- struct{}{}
	if err := h.statsMgr.Save(HealthStatsKey); err != nil {
		log.Println("ERROR: health checker. Failed to save usage. Error:", err)
	}
}

func (h *hc) setup() {
	h.t.CreateFeedIfNotExist("system-load5")
	h.t.CreateFeedIfNotExist("system-mem-used")
	h.t.CreateFeedIfNotExist("system-under-voltage")
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
	if h.Notify.ReportEnable && h.Notify.ReportSchedule != "" {
		h.reporter = cron.New()
		if _, err := h.reporter.AddFunc(h.Notify.ReportSchedule, h.sendReport); err != nil {
			log.Println("ERROR: health checker: invalid report schedule:", h.Notify.ReportSchedule, err)
		} else {
			h.reporter.Start()
			log.Println("Starting health report scheduler:", h.Notify.ReportSchedule)
		}
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
