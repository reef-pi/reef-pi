package controller

import (
	"github.com/reef-pi/reef-pi/controller/lighting"
	"log"
)

const LightingBucket = "lightings"

func (c *Controller) GetLightingCycle() (lighting.CycleConfig, error) {
	var config lighting.Config
	return config.Cycle, c.store.Get(LightingBucket, "config", &config)
}

func (c *Controller) SetLightingCycle(conf lighting.CycleConfig) error {
	var config lighting.Config
	if err := c.store.Get(LightingBucket, "config", &config); err != nil {
		log.Println("ERROR: failed to get lighting config, using default config")
	}
	c.state.lighting.StopCycle()
	config.Cycle = conf
	if config.Cycle.Enabled {
		go c.state.lighting.StartCycle(c.state.pwm, conf)
	}
	return c.store.Update(LightingBucket, "config", config)
}

func (c *Controller) GetFixedLighting() (lighting.FixedConfig, error) {
	var config lighting.Config
	return config.Fixed, c.store.Get(LightingBucket, "config", &config)
}

func (c *Controller) SetFixedLighting(conf lighting.FixedConfig) error {
	var config lighting.Config
	if err := c.store.Get(LightingBucket, "config", &config); err != nil {
		return err
	}
	c.state.lighting.StopCycle()
	config.Fixed = conf
	config.Cycle.Enabled = false
	for chName, ch := range c.state.lighting.Channels {
		c.state.lighting.UpdateChannel(c.state.pwm, ch.Pin, conf[chName])
	}
	return c.store.Update(LightingBucket, "config", config)
}
