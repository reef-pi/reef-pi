package controller

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/mem"
	"log"
	"math"
	"time"
)

const HealthStatsKey = "health_stats"

type HealthCheckNotify struct {
	Enable    bool    `json:"enable"`
	MaxMemory float64 `json:"max_memory"`
	MaxCPU    float64 `json:"max_cpu"`
}

type HealthChecker struct {
	stopCh    chan struct{}
	interval  time.Duration
	telemetry *utils.Telemetry
	Notify    HealthCheckNotify
	store     utils.Store
	statsMgr  *utils.StatsManager
}

type HealthMetric struct {
	Load5      float64        `json:"cpu"`
	UsedMemory float64        `json:"memory"`
	Time       utils.TeleTime `json:"time"`
	len        int
	loadSum    float64
	memorySum  float64
}

func (m1 HealthMetric) Rollup(mx utils.Metric) (utils.Metric, bool) {
	m2 := mx.(HealthMetric)
	m := HealthMetric{
		Time:       m1.Time,
		Load5:      m1.Load5,
		UsedMemory: m1.UsedMemory,
		len:        m1.len,
		loadSum:    m1.loadSum,
		memorySum:  m1.memorySum,
	}
	if m1.Time.Hour() == m2.Time.Hour() {
		m.loadSum += m2.Load5
		m.memorySum += m2.UsedMemory
		m.len += 1
		m.Load5 = utils.TwoDecimal(m.loadSum / float64(m.len))
		m.UsedMemory = utils.TwoDecimal(m.memorySum / float64(m.len))
		return m, false
	}
	return m2, true
}

func (m1 HealthMetric) Before(mx utils.Metric) bool {
	m2 := mx.(HealthMetric)
	return m1.Time.Before(m2.Time)
}

func NewHealthChecker(i time.Duration, notify HealthCheckNotify, telemetry *utils.Telemetry, store utils.Store) *HealthChecker {
	return &HealthChecker{
		interval:  i,
		stopCh:    make(chan struct{}),
		telemetry: telemetry,
		Notify:    notify,
		statsMgr:  utils.NewStatsManager(store, Bucket, 180, 24*7),
		store:     store,
	}
}

func (h *HealthChecker) check() {
	loadStat, err := load.Avg()
	if err != nil {
		log.Println("ERROR: Failed to obtain load average. Error:", err)
		return
	}
	h.telemetry.EmitMetric("system-load5", loadStat.Load5)

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
		Time:       utils.TeleTime(time.Now()),
	}
	h.telemetry.EmitMetric("system-mem-used", usedMemory)
	log.Println("health check: Used memory:", usedMemory, " Load5:", loadStat.Load5)
	h.statsMgr.Update(HealthStatsKey, metric)
	h.NotifyIfNeeded(usedMemory, loadStat.Load5)
}

func (h *HealthChecker) NotifyIfNeeded(memory, load float64) {
	if h.Notify.Enable {
		if load >= h.Notify.MaxCPU {
			subject := "[Reef-Pi ALERT] CPU Load high"
			format := "Current cpu load (%f) is above threshold ( %f )"
			body := fmt.Sprintf(format, load, h.Notify.MaxCPU)
			h.telemetry.Alert(subject, body)
		}
		if memory >= h.Notify.MaxMemory {
			subject := "[Reef-Pi ALERT] Memory consumption is high"
			format := "Current memory consumption (%f) is above threshold ( %f )"
			body := fmt.Sprintf(format, memory, h.Notify.MaxMemory)
			h.telemetry.Alert(subject, body)
		}
	}
}

func (h *HealthChecker) Stop() {
	log.Println("Stopping health checker")
	h.stopCh <- struct{}{}
	if err := h.statsMgr.Save(HealthStatsKey); err != nil {
		log.Println("ERROR: health checker. Failed to save usage. Error:", err)
	}
}

func (h *HealthChecker) setup() {
	h.telemetry.CreateFeedIfNotExist("system-load5")
	h.telemetry.CreateFeedIfNotExist("system-mem-used")
}

func (h *HealthChecker) Start() {
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
	ticker := time.NewTicker(h.interval)
	for {
		select {
		case <-ticker.C:
			h.check()
		case <-h.stopCh:
			ticker.Stop()
			return
		}
	}
}
