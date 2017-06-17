package controller

import (
	"github.com/ranjib/reef-pi/controller/lighting"
	"log"
	"time"
)

const LightingBucket = "lightings"

type Lighting struct {
	stopCh   chan struct{}
	Interval time.Duration
	Channels map[string]int
}

func NewLighting(channels map[string]int) *Lighting {
	interval := time.Second * 5
	return &Lighting{
		Channels: channels,
		Interval: interval,
	}
}

func (l *Lighting) StartCycle(pwm *PWM, conf lighting.CycleConfig) {
	l.stopCh = make(chan struct{})
	ticker := time.NewTicker(l.Interval)
	for {
		select {
		case <-l.stopCh:
			ticker.Stop()
			close(l.stopCh)
			l.stopCh = nil
			return
		case <-ticker.C:
			for ch, pin := range l.Channels {
				expectedValues, ok := conf.ChannelValues[ch]
				if !ok {
					log.Printf("ERROR: Could not find channel '%s' 24 hour cycle values\n", ch)
					continue
				}
				v := lighting.GetCurrentValue(time.Now(), expectedValues)
				l.UpdateChannel(pwm, pin, v)
			}
		}
	}
}

func (l *Lighting) StopCycle() {
	if l.stopCh == nil {
		log.Println("WARNING: stop channel is not initialized.")
		return
	}
	l.stopCh <- struct{}{}
}

func (l *Lighting) UpdateChannel(pwm *PWM, pin, v int) {
	log.Println("Setting pwm value:", v, "for lighting spectrum")
	pwm.Set(pin, v)
}

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
	for ch, pin := range c.state.lighting.Channels {
		c.state.lighting.UpdateChannel(c.state.pwm, pin, conf[ch])
	}
	return c.store.Update(LightingBucket, "config", config)
}

func (l *Lighting) Reconfigure(pwm *PWM, conf lighting.Config) {
	if conf.Cycle.Enabled {
		go l.StartCycle(pwm, conf.Cycle)
		return
	}
	for ch, pin := range l.Channels {
		l.UpdateChannel(pwm, pin, conf.Fixed[ch])
	}
}
