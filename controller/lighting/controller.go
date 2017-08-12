package lighting

import (
	"github.com/reef-pi/reef-pi/controller/utils"
)

const Bucket = "lightings"

type Controller struct {
	store     utils.Store
	pwm       *utils.PWM
	stopCh    chan struct{}
	telemetry *utils.Telemetry
	config    Config
	running   bool
}

func New(conf Config, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		telemetry: telemetry,
		store:     store,
		config:    conf,
		stopCh:    make(chan struct{}),
	}
}

func (c *Controller) GetFixed() (Fixed, error) {
	var config Config
	return config.Fixed, c.store.Get(Bucket, "config", &config.Fixed)
}

func (c *Controller) SetFixed(conf Fixed) error {
	var config Config
	if err := c.store.Get(Bucket, "config", &config); err != nil {
		return err
	}
	config.Fixed = conf
	config.Cycle.Enable = false
	for chName, v := range config.Fixed {
		c.UpdateChannel(chName, v)
	}
	return c.store.Update(Bucket, "config", config)
}

func (c *Controller) Start() {
	config := DefaultConfig
	c.store.Update(Bucket, "config", config)
	if c.config.Cycle.Enable {
		c.StartCycle()
		return
	}
}
func (c *Controller) Stop() {
	if c.config.Cycle.Enable {
		c.StopCycle()
		return
	}
}
