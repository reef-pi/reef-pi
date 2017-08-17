package ato

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
	"time"
)

const Bucket = "ato"

type Config struct {
	Sensor        int           `yaml:"sensor"`
	DevMode       bool          `yaml:"dev_mode"`
	Pump          int           `yaml:"pump"`
	CheckInterval time.Duration `yaml:"check_interval"`
	Control       bool          `yaml:"control"`
	Enable        bool          `yaml:"enable"`
}

type Controller struct {
	config    Config
	telemetry *utils.Telemetry
	stopCh    chan struct{}
	mu        sync.Mutex
	store     utils.Store
	pumpOn    bool
}

func New(config Config, store utils.Store, telemetry *utils.Telemetry) (*Controller, error) {
	if config.CheckInterval <= 0 {
		return nil, fmt.Errorf("CheckInterval for ATO controller must be greater than zero")
	}
	return &Controller{
		config:    config,
		mu:        sync.Mutex{},
		stopCh:    make(chan struct{}),
		store:     store,
		telemetry: telemetry,
	}, nil
}

func (c *Controller) Start() {
	go c.run()
}

func (c *Controller) run() {
	log.Println("Starting ATO controller")
	ticker := time.NewTicker(time.Second * c.config.CheckInterval)
	for {
		select {
		case <-ticker.C:
			reading, err := c.Read()
			if err != nil {
				log.Println("ERROR: Failed to read ATO sensor. Error:", err)
				continue
			}
			log.Println("ATO sensor value:", reading)
			c.telemetry.EmitMetric("ato", reading)
			if c.config.Control {
				if err := c.Control(reading); err != nil {
					log.Println("ERROR: Failed to execute ATO control logic. Error:", err)
				}
			}
		case <-c.stopCh:
			log.Println("Stopping ATO sensor")
			ticker.Stop()
			return
		}
	}
}
func (c *Controller) Stop() {
	c.stopCh <- struct{}{}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}
