package ph

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"log"
	"sync"
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
	readings  map[string]Readings
	mu        *sync.Mutex
}

func New(config Config, bus i2c.Bus, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		config:    config,
		telemetry: telemetry,
		store:     store,
		bus:       bus,
		quitters:  make(map[string]chan struct{}),
		readings:  make(map[string]Readings),
		mu:        &sync.Mutex{},
	}
}

func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return c.store.CreateBucket(ReadingsBucket)
}

func (c *Controller) Start() {
	c.mu.Lock()
	defer c.mu.Unlock()
	probes, err := c.List()
	if err != nil {
		log.Println("ERROR: ph subsystem: Failed to list probes. Error:", err)
		return
	}
	for _, p := range probes {
		if !p.Enable {
			continue
		}
		c.loadReadings(p.ID)
		quit := make(chan struct{})
		c.quitters[p.ID] = quit
		go c.Run(p, quit)
	}
}

func (c *Controller) Stop() {
	for id, quit := range c.quitters {
		close(quit)
		c.saveReadings(id)
		delete(c.quitters, id)
	}
}
