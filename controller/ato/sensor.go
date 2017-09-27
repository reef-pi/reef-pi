package ato

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

func (c *Controller) Read() (int, error) {
	if c.config.DevMode {
		log.Println("ATO is running under dev mode. Sending fixed sensor reading of 1")
		return 1, nil
	}
	return utils.ReadGPIO(c.config.Sensor)
}

func (c *Controller) cachePump() error {
	if c.pump == nil {
		pump, err := c.equipments.Get(c.config.Pump)
		if err != nil {
			return err
		}
		c.pump = &pump
	}
	return nil
}

func (c *Controller) Control(reading int) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if err := c.cachePump(); err != nil {
		log.Println("ERROR: ATO subsystem. Failed to fetch pump details. Error:", err)
		return err
	}
	if reading == 1 { // Water is above the level
		if c.pump.On {
			c.pump.On = false
			if err := c.equipments.Update(c.pump.ID, *c.pump); err != nil {
				return err
			}
			log.Println("Switched off ATO pump")
		}
	} else { // water is below the level
		if !c.pump.On {
			c.pump.On = true
			if err := c.equipments.Update(c.pump.ID, *c.pump); err != nil {
				return err
			}
			log.Println("Switched on ATO pump")
		}
	}
	return nil
}
