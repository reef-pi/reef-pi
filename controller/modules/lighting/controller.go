package lighting

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/pwm_profile"
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
	jacks    *connectors.Jacks
	pManager *pwm_profile.Manager
	stopCh   chan struct{}
	config   Config
	running  bool
	mu       *sync.Mutex
	c        controller.Controller
}

func New(conf Config, c controller.Controller, jacks *connectors.Jacks, pManager *pwm_profile.Manager, bus i2c.Bus) (*Controller, error) {
	return &Controller{
		c:        c,
		jacks:    jacks,
		pManager: pManager,
		config:   conf,
		stopCh:   make(chan struct{}),
		mu:       &sync.Mutex{},
	}, nil
}

func (c *Controller) Start() {
	go c.StartCycle()
}
func (c *Controller) StartCycle() {
	ticker := time.NewTicker(c.config.Interval)
	log.Println("Starting lighting cycle")
	c.mu.Lock()
	c.running = true
	c.mu.Unlock()
	c.syncLights()
	for {
		select {
		case <-c.stopCh:
			ticker.Stop()
			return
		case <-ticker.C:
			c.syncLights()
		}
	}
}

func (c *Controller) Stop() {
	c.mu.Lock()
	if !c.running {
		log.Println("lighting subsystem: controller is not running.")
		return
	}
	c.mu.Unlock()
	c.stopCh <- struct{}{}
	c.running = false
	log.Println("Stopped lighting cycle")
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
func (c *Controller) syncLights() {
	lights, err := c.List()
	if err != nil {
		log.Println("ERROR: lighting sub-system:  Failed to list lights. Error:", err)
		return
	}
	for _, light := range lights {
		c.syncLight(light)
	}
}
