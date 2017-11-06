package controller

import (
	"container/ring"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/mem"
	"log"
	"math"
	"time"
)

type HealthCheckNotify struct {
	Enable    bool    `json:"enable"`
	MaxMemory float64 `json:"max_memory"`
	MaxCPU    float64 `json:"max_cpu"`
}

type HealthChecker struct {
	stopCh        chan struct{}
	interval      time.Duration
	telemetry     *utils.Telemetry
	minutelyUsage *ring.Ring
	hourlyUsage   *ring.Ring
	Notify        HealthCheckNotify
}

type MinutelyHealthMetric struct {
	Load5      float64 `json:"cpu"`
	UsedMemory float64 `json:"memory"`
	Time       string  `json:"time"`
}

type HourlyHealthMetric struct {
	Load5      float64 `json:"cpu"`
	UsedMemory float64 `json:"memory"`
	Time       string  `json:"time"`
	Hour       int     `json:"hour"`
}

func NewHealthChecker(i time.Duration, notify HealthCheckNotify, telemetry *utils.Telemetry) *HealthChecker {
	return &HealthChecker{
		interval:      i,
		stopCh:        make(chan struct{}),
		telemetry:     telemetry,
		minutelyUsage: ring.New(120),
		hourlyUsage:   ring.New(24 * 7), // last 7 days
		Notify:        notify,
	}
}

func (h *HealthChecker) updateUsage(memory, load float64) {
	now := time.Now()
	h.minutelyUsage.Value = MinutelyHealthMetric{
		Load5:      load,
		UsedMemory: memory,
		Time:       now.Format("15:04"),
	}
	h.minutelyUsage = h.minutelyUsage.Next()
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
	h.telemetry.EmitMetric("system-mem-used", usedMemory)
	log.Println("health check: Used memory:", usedMemory, " Load5:", loadStat.Load5)
	h.updateUsage(usedMemory, loadStat.Load5)
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
}

func (h *HealthChecker) setup() {
	h.telemetry.CreateFeedIfNotExist("system-load5")
	h.telemetry.CreateFeedIfNotExist("system-mem-used")
}

func (h *HealthChecker) Start() {
	h.setup()
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
