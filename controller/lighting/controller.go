package lighting

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"time"
)

const Bucket = "lightings"

type Config struct {
	Enable   bool
	Channels map[string]LEDChannel
	Cycle    CycleConfig
	Fixed    FixedConfig
	Interval time.Duration
}
type Controller struct {
	store     utils.Store
	pwm       *utils.PWM
	stopCh    chan struct{}
	telemetry *utils.Telemetry
	config    Config
}

func New(conf Config, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		telemetry: telemetry,
		store:     store,
		config:    conf,
		stopCh:    make(chan struct{}),
	}
}

func (c *Controller) GetFixed() (FixedConfig, error) {
	var config Config
	return config.Fixed, c.store.Get(Bucket, "config", &config)
}

func (c *Controller) SetFixed(conf FixedConfig) error {
	var config Config
	if err := c.store.Get(Bucket, "config", &config); err != nil {
		return err
	}
	c.Stop()
	config.Fixed = conf
	config.Cycle.Enable = false
	for chName, v := range config.Fixed {
		c.UpdateChannel(chName, v)
	}
	return c.store.Update(Bucket, "config", config)
}
