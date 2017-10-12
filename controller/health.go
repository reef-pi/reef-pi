package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
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
