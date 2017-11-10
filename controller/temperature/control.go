package temperature

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
)

type Measurement struct {
	Time        utils.TeleTime `json:"time"`
	Temperature float32        `json:"temperature"`
}

type Usage struct {
	Heater      int            `json:"heater"`
	Cooler      int            `json:"cooler"`
	Time        utils.TeleTime `json:"time"`
	Temperature float32        `json:"temperature"`
	readings    []float32      `json:"-"`
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
	var vOn int
	if on {
		vOn = 1
	}
	c.telemetry.EmitMetric("heater", vOn)
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
	var vOn int
	if on {
		vOn = 1
	}
	c.telemetry.EmitMetric("cooler", vOn)
	return nil
}

func (c *Controller) warmUp() error {
	if err := c.switchCooler(false); err != nil {
		return err
	}
	if err := c.switchHeater(true); err != nil {
		return err
	}
	c.updateHeaterUsage()
	return nil
}

func (c *Controller) coolDown() error {
	if err := c.switchHeater(false); err != nil {
		return err
	}
	if err := c.switchCooler(true); err != nil {
		return err
	}
	c.updateCoolerUsage()
	return nil
}

func (c *Controller) updateHourlyTemperature(reading float32) {
	usage := c.syncUsage()
	usage.readings = append(usage.readings, reading)
	total := float32(0.0)
	for _, v := range usage.readings {
		total += v
	}
	usage.Temperature = total / float32(len(usage.readings))
	c.usage.Value = usage
}

func (c *Controller) updateHeaterUsage() {
	usage := c.syncUsage()
	usage.Heater = usage.Heater + int(c.config.CheckInterval)
	c.usage.Value = usage
}

func (c *Controller) updateCoolerUsage() {
	usage := c.syncUsage()
	usage.Cooler = usage.Cooler + int(c.config.CheckInterval)
	c.usage.Value = usage
}

func (c *Controller) syncUsage() Usage {
	current := Usage{
		Time:     utils.TeleTime(time.Now()),
		readings: []float32{},
	}
	if c.usage.Value == nil {
		c.usage.Value = current
		return current
	}
	previous, ok := c.usage.Value.(Usage)
	if !ok {
		log.Println("ERROR: Temperature subsystem. Failed to typecast previous equipment usage")
		return current
	}
	if previous.Time.Hour() == current.Time.Hour() {
		return previous
	}
	c.usage = c.usage.Next()
	c.usage.Value = current
	return current
}

func (c *Controller) switchOffAll() {
	if (c.cooler != nil) && c.cooler.On {
		c.switchCooler(false)
	}
	if (c.heater != nil) && c.heater.On {
		c.switchHeater(false)
	}
}
