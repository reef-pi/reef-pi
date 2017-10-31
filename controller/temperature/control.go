package temperature

import (
	"log"
	"time"
)

type Measurement struct {
	Time        string  `json:"time"`
	Temperature float32 `json:"temperature"`
}

type Usage struct {
	Heater int `json:"heater"`
	Cooler int `json:"cooler"`
	Hour   int `json:"hour"`
}

func (c *Controller) switchHeater(on bool) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.heater == nil {
		log.Println("Temperature subsystem: heater is not set. Skipping action:", on)
		return nil
	}
	if on != c.heater.On {
		log.Println("Temperature subsystem - switching heater:", on)
		c.heater.On = on
		if err := c.equipments.Update(c.heater.ID, *c.heater); err != nil {
			c.heater.On = !on
			return err
		}
	}
	c.telemetry.EmitMetric("heater", on)
	return nil
}

func (c *Controller) switchCooler(on bool) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.cooler == nil {
		log.Println("Temperature subsystem: cooler is not set. Skipping action:", on)
		return nil
	}
	if on != c.cooler.On {
		log.Println("Temperature subsystem - switching cooler:", on)
		c.cooler.On = on
		if err := c.equipments.Update(c.cooler.ID, *c.cooler); err != nil {
			c.cooler.On = !on
			return err
		}
	}
	c.telemetry.EmitMetric("cooler", on)
	return nil
}

func (c *Controller) warmUp() error {
	if err := c.switchCooler(false); err != nil {
		return err
	}
	if err := c.switchHeater(true); err != nil {
		return err
	}
	c.updateUsage(true, false)
	return nil
}

func (c *Controller) coolDown() error {
	if err := c.switchHeater(false); err != nil {
		return err
	}
	if err := c.switchCooler(true); err != nil {
		return err
	}
	c.updateUsage(false, true)
	return nil
}

func (c *Controller) updateUsage(heater, cooler bool) {
	var heaterMinutes, coolerMinutes int
	if heater {
		heaterMinutes = int(c.config.CheckInterval)
	}
	if cooler {
		coolerMinutes = int(c.config.CheckInterval)
	}
	currentUsage := Usage{
		Heater: heaterMinutes,
		Cooler: coolerMinutes,
		Hour:   time.Now().Hour(),
	}
	if c.usage.Value == nil {
		c.usage.Value = currentUsage
		return
	}
	previousUsage, ok := c.usage.Value.(Usage)
	if !ok {
		log.Println("ERROR: Temperature subsystem. Failed to typecast previous equipment usage")
		return
	}
	if previousUsage.Hour == currentUsage.Hour {
		c.usage.Value = Usage{
			Heater: currentUsage.Heater + heaterMinutes,
			Cooler: currentUsage.Cooler + coolerMinutes,
		}
		return
	}
	c.usage = c.usage.Next()
	c.usage.Value = currentUsage
}

func (c *Controller) switchOffAll() {
	if (c.cooler != nil) && c.cooler.On {
		c.switchCooler(false)
	}
	if (c.heater != nil) && c.heater.On {
		c.switchHeater(false)
	}
}
