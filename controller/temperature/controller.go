package temperature

import (
	"container/ring"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
	"time"
)

const Bucket = "temperature"

type Controller struct {
	config     Config
	stopCh     chan struct{}
	telemetry  *utils.Telemetry
	store      utils.Store
	latest     float32
	readings   *ring.Ring
	usage      *ring.Ring
	mu         sync.Mutex
	devMode    bool
	equipments *equipments.Controller
	heater     *equipments.Equipment
	cooler     *equipments.Equipment
}

func New(devMode bool, store utils.Store, telemetry *utils.Telemetry, eqs *equipments.Controller) (*Controller, error) {
	return &Controller{
		config:     DefaultConfig,
		mu:         sync.Mutex{},
		stopCh:     make(chan struct{}),
		telemetry:  telemetry,
		store:      store,
		devMode:    devMode,
		readings:   ring.New(180),
		usage:      ring.New(24 * 7),
		equipments: eqs,
	}, nil
}

func (c *Controller) IsEquipmentInUse(id string) (bool, error) {
	if c.config.Heater == id {
		return true, nil
	}
	return c.config.Cooler == id, nil
}
func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	conf, err := loadConfig(c.store)
	if err != nil {
		log.Println("WARNING: Temperature controller config not found. Initializing default config")
		conf = DefaultConfig
		if err := saveConfig(c.store, conf); err != nil {
			log.Println("ERROR: Failed to save temperature controller configuration")
			return err
		}
	}
	c.config = conf
	c.telemetry.CreateFeedIfNotExist("temperature")
	c.telemetry.CreateFeedIfNotExist("heater")
	c.telemetry.CreateFeedIfNotExist("cooler")
	return nil
}

func (c *Controller) Start() {
	go c.run()
}

func (c *Controller) loadEquipments() error {
	if c.config.Heater != "" {
		heater, err := c.equipments.Get(c.config.Heater)
		if err != nil {
			return err
		}
		c.heater = &heater
	}
	if c.config.Cooler != "" {
		cooler, err := c.equipments.Get(c.config.Cooler)
		if err != nil {
			return err
		}
		c.cooler = &cooler
	}
	return nil
}

func (c *Controller) run() {
	log.Println("Starting temperature controller")
	ticker := time.NewTicker(time.Minute * c.config.CheckInterval)
	for {
		select {
		case <-ticker.C:
			if !c.config.Enable {
				continue
			}
			reading, err := c.Read()
			if err != nil {
				log.Println("ERROR: Failed to read temperature. Error:", err)
				continue
			}
			c.latest = reading
			c.NotifyIfNeeded(reading)
			c.readings.Value = Measurement{
				Temperature: reading,
				Time:        time.Now(),
			}
			c.readings = c.readings.Next()
			c.updateHourlyTemperature(reading)
			log.Println("Temperature sensor value:", reading)
			c.telemetry.EmitMetric("temperature", reading)
			if c.config.Control {
				c.control(reading)
			}
		case <-c.stopCh:
			log.Println("Stopping temperature controller")
			ticker.Stop()
			return
		}
	}
}

func (c *Controller) Stop() {
	c.stopCh <- struct{}{}
}

func (c *Controller) control(reading float32) error {
	if err := c.loadEquipments(); err != nil {
		log.Println("ERROR: temperature subsystem. Failed to load equipments: Error:", err)
		return err
	}
	switch {
	case reading > c.config.Max:
		log.Println("Current temperature is above maximum threshold. Executing cool down routine")
		return c.coolDown()
	case reading < c.config.Min:
		log.Println("Current temperature is below minimum threshold. Executing warm up routine")
		return c.warmUp()
	default:
		c.switchOffAll()
	}
	return nil
}
