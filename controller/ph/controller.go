package ph

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"log"
	"sync"
)

const Bucket = "phprobes"

type Config struct {
	DevMode bool `json:"dev_mode"`
}

type Controller struct {
	config    Config
	telemetry *utils.Telemetry
	store     utils.Store
	quitters  map[string]chan struct{}
	bus       i2c.Bus
	mu        *sync.Mutex
	statsMgr  *utils.StatsManager
}

func New(config Config, bus i2c.Bus, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		config:    config,
		telemetry: telemetry,
		store:     store,
		bus:       bus,
		quitters:  make(map[string]chan struct{}),
		mu:        &sync.Mutex{},
		statsMgr:  utils.NewStatsManager(store, ReadingsBucket, 180, 24*7),
	}
}

func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return c.store.CreateBucket(ReadingsBucket)
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
		fn := func(d json.RawMessage) interface{} {
			u := Measurement{}
			json.Unmarshal(d, &u)
			return u
		}
		if err := c.statsMgr.Load(p.ID, fn); err != nil {
			log.Println("ERROR: ph controller. Failed to load usage. Error:", err)
		}
		quit := make(chan struct{})
		c.quitters[p.ID] = quit
		go c.Run(p, quit)
	}
}

func (c *Controller) Stop() {
	for id, quit := range c.quitters {
		close(quit)
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: ph controller. Failed to save usage. Error:", err)
		}
		log.Println("ph sub-system: Saved usaged data of sensor:", id)
		delete(c.quitters, id)
	}
}
