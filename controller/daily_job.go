package controller

import (
	"fmt"
	"log"
	"time"
)

type DailyJob struct {
	start, stop time.Time
	periodic    *PeriodicScheduler
}

const (
	format = "15:04"
)

func NewDailyJob(startTime, stopTime string) (Scheduler, error) {
	start, err := time.Parse(format, startTime)
	if err != nil {
		return nil, err
	}
	stop, err := time.Parse(format, stopTime)
	if err != nil {
		return nil, err
	}
	duration := stop.Sub(start)
	if duration < 0 {
		return nil, fmt.Errorf("Start time should be before stop time")
	}
	if duration > (time.Hour * 24) {
		return nil, fmt.Errorf("Difference between start and stop time should be less than 24 hours")
	}
	sched := &PeriodicScheduler{
		quitCh:   make(chan struct{}, 1),
		interval: 24 * time.Hour,
		duration: duration,
	}
	j := &DailyJob{
		start:    start,
		stop:     stop,
		periodic: sched,
	}
	return j, nil

}

func (j *DailyJob) Name() string {
	return "DailyJob"
}
func (j *DailyJob) IsRunning() bool {
	return j.periodic.IsRunning()
}

func (j *DailyJob) Start(dev Device) error {
	nowTime := time.Now().Format(format)
	now, err := time.Parse(format, nowTime)
	if err != nil {
		log.Println(err)
		return err
	}
	if now.Before(j.start) {
		log.Println("Before start")
		log.Println("Sleeping for:", j.start.Sub(now))
		time.Sleep(j.start.Sub(now))
		log.Println("Starting periodic scheduler:", time.Now())
		return j.periodic.Start(dev)
	}
	if now.After(j.start) && now.Before(j.stop) {
		log.Println("After start & before stop")
		go dev.On()
		time.Sleep(j.stop.Sub(now))
		go dev.Off()
		time.Sleep(j.start.Add(24 * time.Hour).Sub(j.stop))
		return j.periodic.Start(dev)
	}
	if now.After(j.stop) {
		log.Println("After stop")
		time.Sleep(j.start.Add(24 * time.Hour).Sub(now))
		return j.periodic.Start(dev)
	}
	return fmt.Errorf("Failed to start. Start time: %s. Stop time: %s", j.start, j.stop)
}

func (j *DailyJob) Stop() error {
	return j.periodic.Stop()
}
