package ato

import (
	"container/ring"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
	"time"
)

const Bucket = "ato"

type Notify struct {
	Enable bool `yaml:"enable" json:"enable"`
	Max    int  `yaml:"max" json:"max"`
}

type Config struct {
	Sensor        int           `json:"sensor" yaml:"sensor"`
	Pump          string        `json:"pump" yaml:"pump"`
	CheckInterval time.Duration `json:"check_interval" yaml:"check_interval"`
	Control       bool          `json:"control" yaml:"control"`
	Enable        bool          `json:"enable" yaml:"enable"`
	Notify        Notify        `json:"notify" yaml:"notify"`
}

var DefaultConfig = Config{
	CheckInterval: 30,
	Sensor:        25,
}

type Controller struct {
	config     Config
	usage      *ring.Ring
	telemetry  *utils.Telemetry
	stopCh     chan struct{}
	mu         sync.Mutex
	store      utils.Store
	pump       *equipments.Equipment
	equipments *equipments.Controller
	devMode    bool
}

func loadConfig(store utils.Store) (Config, error) {
	var conf Config
	return conf, store.Get(Bucket, "config", &conf)
}

func saveConfig(conf Config, store utils.Store) error {
	if conf.CheckInterval <= 0 {
		return fmt.Errorf("CheckInterval for ATO controller must be greater than zero")
	}
	return store.Update(Bucket, "config", conf)
}

func New(devMode bool, store utils.Store, telemetry *utils.Telemetry, eqs *equipments.Controller) (*Controller, error) {
	return &Controller{
		config:     DefaultConfig,
		devMode:    devMode,
		mu:         sync.Mutex{},
		stopCh:     make(chan struct{}),
		store:      store,
		telemetry:  telemetry,
		equipments: eqs,
		usage:      ring.New(24),
	}, nil
}

func (c *Controller) IsEquipmentInUse(id string) (bool, error) {
	return c.config.Pump == id, nil
}

func (c *Controller) Start() {
	c.loadUsage()
	go c.run()
}

func (c *Controller) run() {
	log.Println("Starting ato sub system")
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
			log.Println("ato sub-system:  sensor value:", reading)
			c.telemetry.EmitMetric("ato", reading)
			if c.config.Control {
				if err := c.Control(reading); err != nil {
					log.Println("ERROR: Failed to execute ATO control logic. Error:", err)
				}

				usage := int(c.config.CheckInterval)
				if reading == 1 {
					usage = 0
				}
				c.updateUsage(usage)
			}
		case <-c.stopCh:
			log.Println("Stopping ATO sub-system")
			ticker.Stop()
			return
		}
	}
}
func (c *Controller) Stop() {
	c.stopCh <- struct{}{}
	c.saveUsage()
}

func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	conf, err := loadConfig(c.store)
	if err != nil {
		log.Println("WARNING: ato config not found. Initializing default config")
		conf = DefaultConfig
		if err := saveConfig(conf, c.store); err != nil {
			log.Println("ERROR: Failed to save ato config")
			return err
		}
	}
	c.config = conf
	c.telemetry.CreateFeedIfNotExist("ato")
	return nil
}
