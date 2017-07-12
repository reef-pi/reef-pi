package controller

import (
	"github.com/ranjib/reef-pi/controller/lighting"
	"github.com/ranjib/reef-pi/controller/utils"
	"log"
	"time"
)

const LightingBucket = "lightings"

type Lighting struct {
	stopCh    chan struct{}
	Interval  time.Duration
	Channels  map[string]lighting.LEDChannel
	telemetry *utils.Telemetry
}

func NewLighting(channels map[string]lighting.LEDChannel, telemetry *utils.Telemetry) *Lighting {
	interval := time.Second * 15
	return &Lighting{
		Channels:  channels,
		Interval:  interval,
		telemetry: telemetry,
	}
}

func (l *Lighting) StartCycle(pwm *PWM, conf lighting.CycleConfig) {
	l.stopCh = make(chan struct{})
	ticker := time.NewTicker(l.Interval)
	log.Println("Starting lighting cycle")
	for {
		select {
		case <-l.stopCh:
			ticker.Stop()
			close(l.stopCh)
			l.stopCh = nil
			return
		case <-ticker.C:
			for chName, ch := range l.Channels {
				expectedValues, ok := conf.ChannelValues[chName]
				if !ok {
					log.Printf("ERROR: Could not find channel '%s' 24 hour cycle values\n", chName)
					continue
				}
				v := lighting.GetCurrentValue(time.Now(), expectedValues)
				if (ch.MinTheshold > 0) && (v < ch.MinTheshold) {
					log.Printf("Lighting: Calculated value(%d) for channel '%s' is below minimum threshold(%d). Resetting to 0\n", v, chName, ch.MinTheshold)
					v = 0
				} else if (ch.MaxThreshold > 0) && (v > ch.MaxThreshold) {
					log.Printf("Lighting: Calculated value(%d) for channel '%s' is above maximum threshold(%d). Resetting to %d\n", v, chName, ch.MaxThreshold, ch.MaxThreshold)
					v = ch.MaxThreshold
				}
				l.UpdateChannel(pwm, ch.Pin, v)
				if l.telemetry != nil {
					l.telemetry.EmitMetric(chName, v)
				}
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
	log.Println("Stopped lighting cycle")
}

func (l *Lighting) UpdateChannel(pwm *PWM, pin, v int) {
	log.Println("Setting pwm value:", v, " at pin:", pin)
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
	for chName, ch := range c.state.lighting.Channels {
		c.state.lighting.UpdateChannel(c.state.pwm, ch.Pin, conf[chName])
	}
	return c.store.Update(LightingBucket, "config", config)
}

func (l *Lighting) Reconfigure(pwm *PWM, conf lighting.Config) {
	if conf.Cycle.Enabled {
		go l.StartCycle(pwm, conf.Cycle)
		return
	}
	for chName, ch := range l.Channels {
		l.UpdateChannel(pwm, ch.Pin, conf.Fixed[chName])
	}
}
