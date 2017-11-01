package ato

import (
	"log"
	"time"
)

type Usage struct {
	Pump int `json:"pump"`
	Hour int `json:"hour"`
}

func (c *Controller) updateUsage() {
	minutes := int(c.config.CheckInterval)
	currentUsage := Usage{
		Pump: minutes,
		Hour: time.Now().Hour(),
	}
	if c.usage.Value == nil {
		c.usage.Value = currentUsage
		return
	}
	previousUsage, ok := c.usage.Value.(Usage)
	if !ok {
		log.Println("ERROR: ATO subsystem. Failed to typecast previous equipment usage")
		return
	}
	if previousUsage.Hour == currentUsage.Hour {
		c.usage.Value = Usage{
			Pump: previousUsage.Pump + minutes,
			Hour: currentUsage.Hour,
		}
		return
	}
	c.usage = c.usage.Next()
	c.usage.Value = currentUsage
}
