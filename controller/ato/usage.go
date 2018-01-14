package ato

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
)

type Usage struct {
	Pump int            `json:"pump"`
	Time utils.TeleTime `json:"time"`
}

func (c *Controller) loadUsage() {
	var usage []Usage
	if err := c.store.Get(Bucket, "usage", &usage); err != nil {
		log.Println("ERROR: ato sub-system failed to restore usage statistics from db. Error:", err)
	}
	for _, u := range usage {
		c.usage.Value = u
		c.usage = c.usage.Next()
	}
}

func (c *Controller) saveUsage() {
	usage, err := c.GetUsage()
	if err != nil {
		log.Println("ERROR: ato sub-system failed to fetch usage statistic. Error:", err)
		return
	}
	if err := c.store.Update(Bucket, "usage", usage); err != nil {
		log.Println("ERROR: ato sub-system failed to save usage statistics in db. Error:", err)
	}
}

func (c *Controller) updateUsage(minutes int) {
	current := Usage{
		Pump: minutes,
		Time: utils.TeleTime(time.Now()),
	}
	if c.usage.Value == nil {
		c.usage.Value = current
		return
	}
	previous, ok := c.usage.Value.(Usage)
	if !ok {
		log.Println("ERROR: ato subsystem. Failed to typecast previous equipment usage")
		return
	}
	if previous.Time.Hour() == current.Time.Hour() {
		u := Usage{
			Pump: previous.Pump + minutes,
			Time: previous.Time,
		}
		c.usage.Value = u
		c.NotifyIfNeeded(u)
		return
	}
	c.usage = c.usage.Next()
	c.usage.Value = current
}

func (c *Controller) NotifyIfNeeded(u Usage) {
	if !c.config.Notify.Enable {
		return
	}
	if u.Pump >= c.config.Notify.Max {
		subject := "[Reef-Pi ALERT] ATO pump usage out of range"
		format := "Current usage of ATO pump  (%d) is above acceptable value (%d)"
		body := fmt.Sprintf(format, u.Pump, c.config.Notify.Max)
		c.telemetry.Alert(subject, "Elevated ATO usage. "+body)
		return
	}
}
