package ato

import (
	"github.com/reef-pi/reef-pi/controller/equipments"
	"log"
)

func (c *Controller) Control(a ATO, reading int) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if a.Pump == "" {
		log.Println("ato-subsystem: control enabled but pump not set. Skipping")
		return nil
	}
	action := equipments.EquipmentAction{}
	if reading == 1 { // Water is above the level
		action.On = false
		if err := c.equipments.Control(a.Pump, action); err != nil {
			return err
		}
	} else { // water is below the level
		action.On = true
		if err := c.equipments.Control(a.Pump, action); err != nil {
			return err
		}
	}
	return nil
}
