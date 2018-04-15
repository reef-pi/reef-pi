package controller

import (
	"container/ring"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/mem"
	"log"
	"math"
	"sort"
	"time"
)

type HealthCheckNotify struct {
	Enable    bool    `json:"enable"`
	MaxMemory float64 `json:"max_memory"`
	MaxCPU    float64 `json:"max_cpu"`
}

type HealthChecker struct {
	stopCh    chan struct{}
	interval  time.Duration
	telemetry *utils.Telemetry
	mUsage    *ring.Ring
	hUsage    *ring.Ring
	Notify    HealthCheckNotify
	store     utils.Store
}

type MinutelyHealthMetric struct {
	Load5      float64        `json:"cpu"`
	UsedMemory float64        `json:"memory"`
	Time       utils.TeleTime `json:"time"`
}

type HourlyHealthMetric struct {
	Load5      float64        `json:"cpu"`
	UsedMemory float64        `json:"memory"`
	Time       utils.TeleTime `json:"time"`
	lReadings  []float64
	mReadings  []float64
}

func NewHealthChecker(i time.Duration, notify HealthCheckNotify, telemetry *utils.Telemetry, store utils.Store) *HealthChecker {
	return &HealthChecker{
		interval:  i,
		stopCh:    make(chan struct{}),
		telemetry: telemetry,
		mUsage:    ring.New(60 * 3), // last 3 hours
		hUsage:    ring.New(24 * 7), // last 7 days
		Notify:    notify,
		store:     store,
	}
}

func (h *HealthChecker) syncHourlyMetric(now utils.TeleTime) HourlyHealthMetric {
	current := HourlyHealthMetric{
		Time:      now,
		lReadings: []float64{},
		mReadings: []float64{},
	}
	if h.hUsage.Value == nil {
		h.hUsage.Value = current
		return current
	}
	previous, ok := h.hUsage.Value.(HourlyHealthMetric)
	if !ok {
		log.Println("ERROR: health checker. Failed to typecast previous health check metric")
		return current
	}
	if previous.Time.Hour() == current.Time.Hour() {
		return previous
	}
	h.hUsage = h.hUsage.Next()
	h.hUsage.Value = current
	return current
}

func (h *HealthChecker) updateUsage(memory, load float64) {
	now := utils.TeleTime(time.Now())
	h.mUsage.Value = MinutelyHealthMetric{
		Load5:      load,
		UsedMemory: memory,
		Time:       now,
	}
	h.mUsage = h.mUsage.Next()
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
	h.hUsage.Value = hUsage
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
	h.saveUsage()
}

func (h *HealthChecker) setup() {
	h.telemetry.CreateFeedIfNotExist("system-load5")
	h.telemetry.CreateFeedIfNotExist("system-mem-used")
}

func (h *HealthChecker) Start() {
	h.setup()
	h.loadUsage()
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

func (h *HealthChecker) GetWeeklyUsage() ([]HourlyHealthMetric, error) {
	usage := []HourlyHealthMetric{}
	h.hUsage.Do(func(i interface{}) {
		if i != nil {
			u, ok := i.(HourlyHealthMetric)
			if !ok {
				log.Println("ERROR: health controller subsystem. Failed to typecast hourly usage")
				return
			}
			usage = append(usage, u)
		}
	})
	sort.Slice(usage, func(i, j int) bool {
		return usage[i].Time.Before(usage[j].Time)
	})
	return usage, nil
}

func (h *HealthChecker) GetHourlyUsage() ([]MinutelyHealthMetric, error) {
	usage := []MinutelyHealthMetric{}
	h.mUsage.Do(func(i interface{}) {
		if i != nil {
			u, ok := i.(MinutelyHealthMetric)
			if !ok {
				log.Println("ERROR: health check sub-system. Failed to typecast cpu/memory  usage")
				return
			}
			usage = append(usage, u)
		}
	})
	sort.Slice(usage, func(i, j int) bool {
		return usage[i].Time.Before(usage[j].Time)
	})
	return usage, nil
}

func (h *HealthChecker) loadUsage() {
	var mUsage []MinutelyHealthMetric
	var hUsage []HourlyHealthMetric
	if err := h.store.Get(Bucket, "m_usage", &mUsage); err != nil {
		log.Println("ERROR: health check sub-system failed to restore hourly usage statistics from db. Error:", err)
	}
	if err := h.store.Get(Bucket, "h_usage", &hUsage); err != nil {
		log.Println("ERROR: health check sub-system failed to restore weekly usage statistics from db. Error:", err)
	}
	for _, u := range mUsage {
		h.mUsage.Value = u
		h.mUsage = h.mUsage.Next()
	}
	for _, u := range hUsage {
		h.hUsage.Value = u
		h.hUsage = h.hUsage.Next()
	}
}

func (h *HealthChecker) saveUsage() {
	mUsage, err := h.GetHourlyUsage()
	if err != nil {
		log.Println("ERROR: health check sub-system failed to fetch hourly usage statistic. Error:", err)
	}
	if err := h.store.Update(Bucket, "m_usage", mUsage); err != nil {
		log.Println("ERROR: health check sub-system failed to save hourly usage statistics in db. Error:", err)
	}
	hUsage, err := h.GetWeeklyUsage()
	if err != nil {
		log.Println("ERROR: health check sub-system failed to fetch weekly usage statistic. Error:", err)
	}
	if err := h.store.Update(Bucket, "h_usage", hUsage); err != nil {
		log.Println("ERROR: health check sub-system failed to save weekly usage statistics in db. Error:", err)
	}
}
