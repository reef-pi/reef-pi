package controller

import (
	"github.com/ranjib/reef-pi/controller/lighting"
	"log"
	"time"
)

const LightingBucket = "lightings"

type Lighting struct {
	IntensityChannel int
	SpectrumChannel  int
	stopCh           chan struct{}
	Interval         time.Duration
}

func NewLighting(i, s int) *Lighting {
	interval := time.Second * 5
	return &Lighting{
		IntensityChannel: i,
		SpectrumChannel:  s,
		stopCh:           make(chan struct{}),
		Interval:         interval,
	}
}

func (l *Lighting) StartCycle(pwm *PWM, conf lighting.CycleConfig) {
	ticker := time.NewTicker(l.Interval)
Loop:
	for {
		select {
		case <-l.stopCh:
			ticker.Stop()
			break Loop
		case <-ticker.C:
			i := lighting.GetCurrentValue(time.Now(), conf.Intensities)
			l.SetIntensity(pwm, i)
			s := lighting.GetCurrentValue(time.Now(), conf.Spectrums)
			l.SetSpectrum(pwm, s)
		}
	}
	return
}

func (l *Lighting) StopCycle() {
	if l.stopCh == nil {
		log.Println("WARNING: stop channel is not initialized.")
		return
	}
	l.stopCh <- struct{}{}
}

func (l *Lighting) SetIntensity(pwm *PWM, v int) {
	log.Println("Setting pwm value:", v, "for lighting intensity")
	pwm.Set(l.IntensityChannel, v)
}

func (l *Lighting) SetSpectrum(pwm *PWM, v int) {
	log.Println("Setting pwm value:", v, "for lighting spectrum")
	pwm.Set(l.SpectrumChannel, v)
}

func (c *Controller) GetLightingCycle() (lighting.CycleConfig, error) {
	var config lighting.Config
	return config.CycleConfig, c.store.Get(LightingBucket, "config", &config)
}

func (c *Controller) SetLightingCycle(conf lighting.CycleConfig) error {
	var config lighting.Config
	if err := c.store.Get(LightingBucket, "config", &config); err != nil {
		return err
	}
	c.state.lighting.StopCycle()
	config.CycleConfig = conf
	if config.CycleConfig.Enabled {
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
	config.CycleConfig.Enabled = false
	c.state.lighting.SetIntensity(c.state.pwm, config.Fixed.Intensity)
	c.state.lighting.SetSpectrum(c.state.pwm, config.Fixed.Spectrum)
	return c.store.Update(LightingBucket, "config", config)
}

func (l *Lighting) Reconfigure(pwm *PWM, conf lighting.Config) {
	if conf.CycleConfig.Enabled {
		l.StartCycle(pwm, conf.CycleConfig)
	}
	l.SetIntensity(pwm, conf.Fixed.Intensity)
	l.SetSpectrum(pwm, conf.Fixed.Spectrum)
}
