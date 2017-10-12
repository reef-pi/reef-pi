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
	h.telemetry.EmitMetric("system_load5", loadStat.Load5)

	vmStat, err := mem.VirtualMemory()
	if err != nil {
		log.Println("ERROR: Failed to obtain memory stats. Error:", err)
		return
	}
	h.telemetry.EmitMetric("system_mem_free", vmStat.Free)
	log.Println("health check: Free memory:", vmStat.Free, " Load5:", loadStat.Load5)
}

func (h *HealthChecker) Stop() {
	log.Println("Stopping health checker")
	h.stopCh <- struct{}{}
}

func (h *HealthChecker) setup() {
	h.telemetry.CreateFeedIfNotExist("system_load5")
	h.telemetry.CreateFeedIfNotExist("system_mem_free")
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
