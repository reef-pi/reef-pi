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
	stopCh        chan struct{}
	interval      time.Duration
	telemetry     *utils.Telemetry
	minutelyUsage *ring.Ring
	hourlyUsage   *ring.Ring
	Notify        HealthCheckNotify
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
	lReadings  []float64      `json:"-"`
	mReadings  []float64      `json:"-"`
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

func (h *HealthChecker) syncHourlyMetric(now utils.TeleTime) HourlyHealthMetric {
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
	now := utils.TeleTime(time.Now())
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

func (h *HealthChecker) GetWeeklyUsage() ([]HourlyHealthMetric, error) {
	usage := []HourlyHealthMetric{}
	h.minutelyUsage.Do(func(i interface{}) {
		if i != nil {
			u, ok := i.(HourlyHealthMetric)
			if !ok {
				log.Println("ERROR: health controller subsystem. Failed to typecast temperature readcontroller usage")
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
	h.minutelyUsage.Do(func(i interface{}) {
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

func (h *HealthChecker) loadUsage(store utils.Store) {
	var mUsage []MinutelyHealthMetric
	if err := c.store.Get(Bucket, "usage", &usage); err != nil {
		log.Println("ERROR: ato sub-system failed to restore usage statistics from db. Error:", err)
	}
	for _, u := range usage {
		c.usage.Value = u
		c.usage.Next()
	}
}
func (h *HealthChecker) saveUsage(store utils.Store) {
	mUsage, err := c.GetUsage()
	if err != nil {
		log.Println("ERROR: ato sub-system failed to fetch usage statistic. Error:", err)
		return
	}
	if err := c.store.Update(Bucket, "usage", usage); err != nil {
		log.Println("ERROR: ato sub-system failed to save usage statistics in db. Error:", err)
	}
}
