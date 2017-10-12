// +build !darwin

package controller

import (
	_ "github.com/kidoman/embd/host/rpi"
	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/mem"
)

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
