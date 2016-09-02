package controller

import (
	"time"
)

type PeriodicScheduler struct {
	ticker *time.Ticker
	quitCh chan struct{}
}

func NewPeriodicScheduler(interval time.Duration) *PeriodicScheduler {
	return &PeriodicScheduler{
		ticker: time.NewTicker(interval * time.Second),
		quitCh: make(chan struct{}),
	}
}

func (p *PeriodicScheduler) Start(dev Device) {
	for {
		select {
		case <-p.ticker.C:
			dev.On()
			dev.Off()
		case <-p.quitCh:
			p.ticker.Stop()
			return
		}
	}
}

func (p *PeriodicScheduler) Stop() {
	p.quitCh <- struct{}{}
}
