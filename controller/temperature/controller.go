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

type Measurement struct {
	Time        string  `json:"time"`
	Temperature float32 `json:"temperature"`
}

type Controller struct {
	config     Config
	stopCh     chan struct{}
	telemetry  *utils.Telemetry
	store      utils.Store
	latest     float32
	readings   *ring.Ring
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
		readings:   ring.New(20),
		equipments: eqs,
	}, nil
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

func (c *Controller) cacheEquipments() error {
	if c.heater == nil {
		heater, err := c.equipments.Get(c.config.Heater)
		if err != nil {
			return err
		}
		c.heater = &heater
	}
	if c.cooler == nil {
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
			c.readings.Value = Measurement{
				Temperature: reading,
				Time:        time.Now().Format("15:04"),
			}
			c.readings = c.readings.Next()
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

func (c *Controller) switchHeater(on bool) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if on != c.heater.On {
		log.Println("Temperature subsystem - switching heater on:", on)
		c.heater.On = on
		if err := c.equipments.Update(c.heater.ID, *c.heater); err != nil {
			c.heater.On = !on
			return err
		}
	}
	c.telemetry.EmitMetric("heater", on)
	return nil
}

func (c *Controller) switchCooler(on bool) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if on != c.cooler.On {
		log.Println("Temperature subsystem - switching cooler on:", on)
		c.cooler.On = on
		if err := c.equipments.Update(c.cooler.ID, *c.cooler); err != nil {
			c.cooler.On = !on
			return err
		}
	}
	c.telemetry.EmitMetric("cooler", on)
	return nil
}

func (c *Controller) warmUp() error {
	if c.cooler.On {
		log.Println("WARNING: Possible flapping. Turning off cooler due to warm up routine.")
		if err := c.switchCooler(false); err != nil {
			return err
		}
	}
	if c.heater.On {
		log.Println("Heater is already on. Skipping switch on")
		return nil
	}
	if err := c.switchHeater(true); err != nil {
		return err
	}
	return nil
}

func (c *Controller) coolDown() error {
	if c.heater.On {
		log.Println("WARNING: Possible flapping. Turning off heater due to cool down routine.")
		if err := c.switchHeater(false); err != nil {
			return err
		}
	}
	if c.cooler.On {
		log.Println("Cooler is already on. Skipping switch on")
		return nil
	}
	if err := c.switchCooler(true); err != nil {
		return err
	}
	return nil
}

func (c *Controller) control(reading float32) error {
	if err := c.cacheEquipments(); err != nil {
		log.Println("ERROR: Failed to ")
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
		if c.cooler.On {
			c.switchCooler(false)
		}
		if c.heater.On {
			c.switchHeater(false)
		}
	}
	return nil
}
