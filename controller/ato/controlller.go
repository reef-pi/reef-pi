package ato

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
)

const Bucket = "ato"
const UsageBucket = "ato_usage"

type Controller struct {
	telemetry  *utils.Telemetry
	statsMgr   *utils.StatsManager
	store      utils.Store
	equipments *equipments.Controller
	devMode    bool
	quitters   map[string]chan struct{}
	mu         *sync.Mutex
	inlets     *connectors.Inlets
}

func New(devMode bool, store utils.Store, telemetry *utils.Telemetry, eqs *equipments.Controller, inlets *connectors.Inlets) (*Controller, error) {
	return &Controller{
		devMode:    devMode,
		mu:         &sync.Mutex{},
		store:      store,
		inlets:     inlets,
		telemetry:  telemetry,
		equipments: eqs,
		quitters:   make(map[string]chan struct{}),
		statsMgr:   utils.NewStatsManager(store, UsageBucket, 180, 24*7),
	}, nil
}

func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return c.store.CreateBucket(UsageBucket)
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
