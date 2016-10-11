package controller

import (
	"fmt"
	"time"
)

type PeriodicScheduler struct {
	interval time.Duration
	duration time.Duration
	quitCh   chan struct{}
	running  bool
}

func NewPeriodicScheduler(interval, duration time.Duration) Scheduler {
	return &PeriodicScheduler{
		quitCh:   make(chan struct{}, 1),
		interval: interval,
		duration: duration,
		running:  false,
	}
}

func (p *PeriodicScheduler) IsRunning() bool {
	return p.running
}

func (p *PeriodicScheduler) Name() string {
	return "periodic"
}
func (p *PeriodicScheduler) String() string {
	return fmt.Sprintf("%s[interval: %v duration:%v]", p.Name(), p.interval, p.duration)

}

func (p *PeriodicScheduler) Start(dev Device) error {
	if p.running {
		return fmt.Errorf("Scheduler %s already running", p.String())
	}
	fmt.Println("Starting scheduler with ", p.interval, "interval and", p.duration, "duration")
	p.running = true
	ticker := time.NewTicker(p.interval)
	var after <-chan time.Time
	for {
		select {
		case <-after:
			dev.Off()
		case <-ticker.C:
			dev.On()
			after = time.After(p.duration)
		case <-p.quitCh:
			ticker.Stop()
			p.running = false
			return nil
		}
	}
	p.running = false
	return nil
}

func (p *PeriodicScheduler) Stop() error {
	if p.running {
		return fmt.Errorf("Scheduler[%s] already running", p.Name())
	}
	p.quitCh <- struct{}{}
	return nil
}
