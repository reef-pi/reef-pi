package ato

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
	"time"
)

const Bucket = "ato"

type Config struct {
	Sensor        int           `json:"sensor" yaml:"sensor"`
	DevMode       bool          `json:"dev_mode" yaml:"dev_mode"`
	Pump          string        `json:"pump" yaml:"pump"`
	CheckInterval time.Duration `json:"check_interval" yaml:"check_interval"`
	Control       bool          `json:"control" yaml:"control"`
	Enable        bool          `json:"enable" yaml:"enable"`
}

var DefaultConfig = Config{
	CheckInterval: 30,
	DevMode:       true,
	Sensor:        25,
}

type Controller struct {
	config     Config
	telemetry  *utils.Telemetry
	stopCh     chan struct{}
	mu         sync.Mutex
	store      utils.Store
	pump       *equipments.Equipment
	equipments *equipments.Controller
}

func loadConfig(store utils.Store) Config {
	var conf Config
	if err := store.Get(Bucket, "config", &conf); err != nil {
		log.Println("WARNING: ATO config not found. Using default config")
		conf = DefaultConfig
	}
	return conf
}

func New(devMode bool, store utils.Store, telemetry *utils.Telemetry, eqs *equipments.Controller) (*Controller, error) {
	config := loadConfig(store)
	config.DevMode = devMode
	if config.CheckInterval <= 0 {
		return nil, fmt.Errorf("CheckInterval for ATO controller must be greater than zero")
	}
	return &Controller{
		config:     config,
		mu:         sync.Mutex{},
		stopCh:     make(chan struct{}),
		store:      store,
		telemetry:  telemetry,
		equipments: eqs,
	}, nil
}

func (c *Controller) Start() {
	go c.run()
}

func (c *Controller) run() {
	log.Println("Starting ATO controller")
	ticker := time.NewTicker(c.config.CheckInterval * time.Second)
	for {
		select {
		case <-ticker.C:
			if !c.config.Enable {
				continue
			}
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
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	c.telemetry.CreateFeedIfNotExist("ato")
	return nil
}
