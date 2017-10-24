package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/mem"
	"log"
	"time"
)

type HealthChecker struct {
	stopCh    chan struct{}
	interval  time.Duration
	telemetry *utils.Telemetry
}

func NewHealthChecker(i time.Duration, telemetry *utils.Telemetry) *HealthChecker {
	return &HealthChecker{
		interval:  i,
		stopCh:    make(chan struct{}),
		telemetry: telemetry,
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
	h.telemetry.EmitMetric("system-mem-used", vmStat.UsedPercent)
	log.Println("health check: Used memory:", vmStat.UsedPercent, " Load5:", loadStat.Load5)
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
