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

func (c *Controller) updateUsage() {
	minutes := int(c.config.CheckInterval)
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
		log.Println("ERROR: ATO subsystem. Failed to typecast previous equipment usage")
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
