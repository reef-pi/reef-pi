package controller

import (
	"time"
)

type PeriodicScheduler struct {
	interval time.Duration
	duration time.Duration
	quitCh   chan struct{}
}

func NewPeriodicScheduler(interval, duration time.Duration) *PeriodicScheduler {
	return &PeriodicScheduler{
		quitCh:   make(chan struct{}),
		interval: interval,
		duration: duration,
	}
}

func (p *PeriodicScheduler) Start(dev Device) error {
	ticker := time.NewTicker(p.interval * time.Second)
	var after <-chan time.Time
	for {
		select {
		case <-after:
			dev.Off()
		case <-ticker.C:
			dev.On()
			after = time.After(p.duration * time.Second)
		case <-p.quitCh:
			ticker.Stop()
			return nil
		}
	}
	return nil
}

func (p *PeriodicScheduler) Stop() error {
	p.quitCh <- struct{}{}
	return nil
}
