package lighting

import (
	"fmt"
	"sync"
	"time"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
)

const Bucket = storage.LightingBucket

type Config struct {
	DevMode  bool          `json:"dev_mode"`
	Interval time.Duration `json:"interval"`
}

var DefaultConfig = Config{
	Interval: 15 * time.Second,
}

type Controller struct {
	jacks   *connectors.Jacks
	stopCh  chan struct{}
	config  Config
	running bool
	mu      *sync.Mutex
	c       controller.Controller
}

func New(conf Config, c controller.Controller, jacks *connectors.Jacks, bus i2c.Bus) (*Controller, error) {
	return &Controller{
		c:      c,
		jacks:  jacks,
		config: conf,
		stopCh: make(chan struct{}),
		mu:     &sync.Mutex{},
	}, nil
}

func (c *Controller) Start() {
	go c.StartCycle()
}

func (c *Controller) Stop() {
	c.StopCycle()
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	lights, err := c.List()
	if err != nil {
		return err
	}
	for _, light := range lights {
		for _, ch := range light.Channels {
			c.c.Telemetry().CreateFeedIfNotExist(light.Name + "-" + ch.Name)
		}
	}
	return nil
}

func (c *Controller) On(id string, on bool) error {
	return fmt.Errorf("lighting subsystem does not support 'on' api yet")
}
