package ato

import (
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
		c.usage.Value = Usage{
			Pump: previous.Pump + minutes,
			Time: previous.Time,
		}
		return
	}
	c.usage = c.usage.Next()
	c.usage.Value = current
}
