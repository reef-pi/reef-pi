package ato

import (
	"github.com/ranjib/reef-pi/controller/utils"
)

func (c *Controller) Read() (int, error) {
	return utils.ReadGPIO(c.config.Sensor)
}

func (c *Controller) Control(reading int) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if reading == 1 {
		if c.pumpOn {
			if err := utils.SwitchOff(c.config.Pump); err != nil {
				return err
			}
			c.pumpOn = false
		}
	} else {
		if !c.pumpOn {
			if err := utils.SwitchOn(c.config.Pump); err != nil {
				return err
			}
			c.pumpOn = false
		}
	}
	return nil
}
