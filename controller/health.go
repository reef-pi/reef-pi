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

type TeleTime struct {
	time.Time
}

func (t TeleTime) Before(t2 TeleTime) bool {
	return t.Before(t2)
}

func (t TeleTime) MarshalJSON() ([]byte, error) {
	format := "Jan-02-15:04"
	b := make([]byte, 0, len(format)+2)
	b = append(b, '"')
	b = t.AppendFormat(b, format)
	b = append(b, '"')
	return b, nil
}

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
	Load5      float64  `json:"cpu"`
	UsedMemory float64  `json:"memory"`
	Time       TeleTime `json:"time"`
}

type HourlyHealthMetric struct {
	Load5      float64   `json:"cpu"`
	UsedMemory float64   `json:"memory"`
	Time       TeleTime  `json:"time"`
	lReadings  []float64 `json:"-"`
	mReadings  []float64 `json:"-"`
}

func NewHealthChecker(i time.Duration, notify HealthCheckNotify, telemetry *utils.Telemetry) *HealthChecker {
	return &HealthChecker{
		interval:      i,
		stopCh:        make(chan struct{}),
		telemetry:     telemetry,
		minutelyUsage: ring.New(60 * 3), // last 3 hours
		hourlyUsage:   ring.New(24 * 7), // last 7 days
		Notify:        notify,
	}
}

func (h *HealthChecker) syncHourlyMetric(now TeleTime) HourlyHealthMetric {
	current := HourlyHealthMetric{
		Time:      now,
		lReadings: []float64{},
		mReadings: []float64{},
	}
	if h.hourlyUsage.Value == nil {
		h.hourlyUsage.Value = current
		return current
	}
	previous, ok := h.hourlyUsage.Value.(HourlyHealthMetric)
	if !ok {
		log.Println("ERROR: health checker. Failed to typecast previous health check metric")
		return current
	}
	if previous.Time.Hour() == current.Time.Hour() {
		return previous
	}
	h.hourlyUsage = h.hourlyUsage.Next()
	h.hourlyUsage.Value = current
	return current
}

func (h *HealthChecker) updateUsage(memory, load float64) {
	now := TeleTime{time.Now()}
	h.minutelyUsage.Value = MinutelyHealthMetric{
		Load5:      load,
		UsedMemory: memory,
		Time:       now,
	}
	h.minutelyUsage = h.minutelyUsage.Next()
	hUsage := h.syncHourlyMetric(now)
	hUsage.lReadings = append(hUsage.lReadings, load)
	hUsage.mReadings = append(hUsage.mReadings, memory)
	size := len(hUsage.lReadings)
	lTotal := 0.0
	mTotal := 0.0
	for i := 0; i < size; i++ {
		lTotal += hUsage.lReadings[i]
		mTotal += hUsage.mReadings[i]
	}
	hUsage.Load5 = lTotal / float64(len(hUsage.lReadings))
	hUsage.UsedMemory = mTotal / float64(len(hUsage.mReadings))
	h.hourlyUsage.Value = hUsage
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

func (h *HealthChecker) GetUsage() {
}
