package ato

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.ATOBucket
const UsageBucket = storage.ATOUsageBucket

type Controller struct {
	statsMgr  telemetry.StatsManager
	equipment *equipment.Controller
	devMode   bool
	quitters  map[string]chan struct{}
	mu        *sync.Mutex
	inlets    *connectors.Inlets
	c         controller.Controller
}

func New(devMode bool, c controller.Controller, eqs *equipment.Controller, inlets *connectors.Inlets) (*Controller, error) {
	return &Controller{
		devMode:   devMode,
		mu:        &sync.Mutex{},
		inlets:    inlets,
		equipment: eqs,
		quitters:  make(map[string]chan struct{}),
		statsMgr:  telemetry.NewStatsManager(c.Store(), UsageBucket, telemetry.CurrentLimit, telemetry.HistoricalLimit),
		c:         c,
	}, nil
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	return c.c.Store().CreateBucket(UsageBucket)
}

func (c *Controller) Start() {
	c.mu.Lock()
	defer c.mu.Unlock()
	atos, err := c.List()
	if err != nil {
		log.Println("ERROR: ato subsystem: Failed to list sensors. Error:", err)
		return
	}
	for _, a := range atos {
		if !a.Enable {
			continue
		}
		fn := func(d json.RawMessage) interface{} {
			u := Usage{}
			json.Unmarshal(d, &u)
			return u
		}
		if err := c.statsMgr.Load(a.ID, fn); err != nil {
			log.Println("ERROR: ato controller. Failed to load usage. Error:", err)
		}
		quit := make(chan struct{})
		c.quitters[a.ID] = quit
		go c.Run(a, quit)
	}
}

func (c *Controller) Stop() {
	for id, quit := range c.quitters {
		close(quit)
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: ato controller. Failed to save usage. Error:", err)
		}
		log.Println("ato sub-system: Saved usaged data of sensor:", id)
		delete(c.quitters, id)
	}
}
