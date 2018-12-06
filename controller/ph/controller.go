package ph

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"github.com/reef-pi/types"
)

const Bucket = types.PhBucket

type Config struct {
	DevMode bool `json:"dev_mode"`
}

type Controller struct {
	config     Config
	controller types.Controller
	quitters   map[string]chan struct{}
	bus        i2c.Bus
	mu         *sync.Mutex
	statsMgr   types.StatsManager
}

func New(config Config, bus i2c.Bus, c types.Controller) *Controller {
	return &Controller{
		config:     config,
		bus:        bus,
		quitters:   make(map[string]chan struct{}),
		controller: c,
		mu:         &sync.Mutex{},
		statsMgr:   utils.NewStatsManager(c.Store(), ReadingsBucket, types.CurrentLimit, types.HistoricalLimit),
	}
}

func (c *Controller) Setup() error {
	if err := c.controller.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	return c.controller.Store().CreateBucket(ReadingsBucket)
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

func (c *Controller) On(id string, b bool) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	p.Enable = b
	return c.Update(id, p)
}
