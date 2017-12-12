package ato

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"math/rand"
)

func (c *Controller) Read() (int, error) {
	if c.devMode {
		v := 0
		if rand.Int()%2 == 0 {
			v = 1
		}
		return v, nil
	}
	return utils.ReadGPIO(c.config.Sensor)
}

func (c *Controller) cachePump() error {
	if c.pump == nil {
		pump, err := c.equipment.Get(c.config.Pump)
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
			if err := c.equipment.Update(c.pump.ID, *c.pump); err != nil {
				c.pump.On = true
				return err
			}
			log.Println("Switched off ATO pump")
		}
	} else { // water is below the level
		if !c.pump.On {
			c.pump.On = true
			if err := c.equipment.Update(c.pump.ID, *c.pump); err != nil {
				c.pump.On = false
				return err
			}
			log.Println("Switched on ATO pump")
		}
		c.updateUsage()
	}
	return nil
}
