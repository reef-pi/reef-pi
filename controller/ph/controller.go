package ph

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"log"
)

const Bucket = "phprobes"

type Config struct {
	DevMode bool `json:"dev_mode" yaml:"dev_mode"`
}

type Controller struct {
	config    Config
	telemetry *utils.Telemetry
	store     utils.Store
	quitters  map[string]chan struct{}
	bus       i2c.Bus
}

func New(config Config, bus i2c.Bus, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		config:    config,
		telemetry: telemetry,
		store:     store,
		bus:       bus,
		quitters:  make(map[string]chan struct{}),
	}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}

func (c *Controller) Start() {
	probes, err := c.List()
	if err != nil {
		log.Println("ERROR: ph subsystem: Failed to list probes. Error:", err)
		return
	}
	for _, p := range probes {
		if !p.Enable {
			continue
		}
		c.quitters[p.ID] = make(chan struct{})
		go p.Run(c.bus, c.quitters[p.ID])
	}
}

func (c *Controller) Stop() {
	for _, quit := range c.quitters {
		close(quit)
	}
}
