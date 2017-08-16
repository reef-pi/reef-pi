package lighting

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"sync"
)

const Bucket = "lightings"

type Controller struct {
	store     utils.Store
	pwm       *utils.PWM
	stopCh    chan struct{}
	telemetry *utils.Telemetry
	config    Config
	running   bool
	mu        *sync.Mutex
}

func New(conf Config, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		telemetry: telemetry,
		store:     store,
		config:    conf,
		stopCh:    make(chan struct{}),
		mu:        &sync.Mutex{},
	}
}

func (c *Controller) GetFixed() (Fixed, error) {
	var config Config
	return config.Fixed, c.store.Get(Bucket, "config", &config)
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
	if c.config.Cycle.Enable {
		go c.StartCycle()
		return
	}
}
func (c *Controller) Stop() {
	if c.config.Cycle.Enable {
		c.StopCycle()
		return
	}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}
