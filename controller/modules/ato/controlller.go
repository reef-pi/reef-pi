package ato

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.ATOBucket
const UsageBucket = storage.ATOUsageBucket

type Controller struct {
	statsMgr telemetry.StatsManager
	devMode  bool
	quitters map[string]chan struct{}
	mu       *sync.Mutex
	inlets   *connectors.Inlets
	c        controller.Controller
}

func New(devMode bool, c controller.Controller) (*Controller, error) {
	con := &Controller{
		devMode:  devMode,
		mu:       &sync.Mutex{},
		inlets:   c.DM().Inlets(),
		quitters: make(map[string]chan struct{}),
		statsMgr: c.Telemetry().NewStatsManager(UsageBucket),
		c:        c,
	}
	return con, nil
}
func (c *Controller) sub(a ATO) (controller.Subsystem, error) {
	if a.IsMacro {
		return c.c.Subsystem(storage.MacroBucket)
	}
	return c.c.Subsystem(storage.EquipmentBucket)
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
	c.mu.Lock()
	defer c.mu.Unlock()
	for id, quit := range c.quitters {
		close(quit)
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: ato controller. Failed to save usage. Error:", err)
		}
		log.Println("ato sub-system: Saved usaged data of sensor:", id)
		delete(c.quitters, id)
	}
}

func (c *Controller) Control(a ATO, reading int) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if a.Pump == "" {
		log.Println("ato-subsystem: control enabled but pump not set. Skipping")
		return nil
	}
	sub, err := c.sub(a)
	if err != nil {
		return err
	}
	switch reading {
	case 1:
		return sub.On(a.Pump, false)
	default:
		return sub.On(a.Pump, true)
	}
}

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	switch depType {
	case storage.EquipmentBucket:
		atos, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, a := range atos {
			if a.Pump == id && !a.IsMacro {
				deps = append(deps, a.Name)
			}
		}
		return deps, nil
	case storage.InletBucket:
		atos, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, a := range atos {
			if a.Inlet == id {
				deps = append(deps, a.Name)
			}
		}
		return deps, nil
	case storage.MacroBucket:
		atos, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, a := range atos {
			if a.IsMacro && a.Pump == id {
				deps = append(deps, a.Name)
			}
		}
		return deps, nil
	default:
		return deps, fmt.Errorf("unknown dependency type:%s", depType)
	}
}

func (c *Controller) GetEntity(id string) (controller.Entity, error) {
	return c.Get(id)
}
