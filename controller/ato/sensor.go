package ato

import (
	"log"
)

func (c *Controller) Control(a ATO, reading int) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if a.Pump == "" {
		log.Println("ato-subsystem: control enabled but pump not set. Skipping")
		return nil
	}
	if reading == 1 { // Water is above the level
		if err := c.equipments.Control(a.Pump, false); err != nil {
			return err
		}
	} else { // water is below the level
		if err := c.equipments.Control(a.Pump, true); err != nil {
			return err
		}
	}
	return nil
}
