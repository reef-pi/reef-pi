package ato

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const Bucket = storage.ATOBucket
const UsageBucket = storage.ATOUsageBucket

type Controller struct {
	statsMgr     telemetry.StatsManager
	devMode      bool
	workers      utils.KeyedWorkers
	mu           *sync.Mutex
	lifecycleMu  sync.Mutex
	inlets       *connectors.Inlets
	c            controller.Controller
	repo         repository
	lowSince     map[string]*time.Time
	workerRunner func(ATO, <-chan struct{}) error
}

func New(devMode bool, c controller.Controller) (*Controller, error) {
	con := &Controller{
		devMode:  devMode,
		mu:       &sync.Mutex{},
		inlets:   c.DM().Inlets(),
		statsMgr: c.Telemetry().NewStatsManager(UsageBucket),
		c:        c,
		repo:     newRepository(c.Store()),
		lowSince: make(map[string]*time.Time),
	}
	return con, nil
}

func (c *Controller) inUseBy(matches func(ATO) bool) ([]string, error) {
	atos, err := c.List()
	if err != nil {
		return nil, err
	}

	deps := make([]string, 0, len(atos))
	for _, a := range atos {
		if matches(a) {
			deps = append(deps, a.Name)
		}
	}
	return deps, nil
}

func (c *Controller) sub(a ATO) (controller.Subsystem, error) {
	if a.IsMacro {
		return c.c.Subsystem(storage.MacroBucket)
	}
	return c.c.Subsystem(storage.EquipmentBucket)
}

func (c *Controller) Setup() error {
	return c.repo.Setup()
}

func (c *Controller) Start() {
	c.lifecycleMu.Lock()
	defer c.lifecycleMu.Unlock()
	atos, err := c.List()
	if err != nil {
		log.Println("ERROR: ato subsystem: Failed to list sensors. Error:", err)
		return
	}
	for _, a := range atos {
		c.stopWorkerLocked(a.ID)
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
		c.startWorkerLocked(a)
	}
}

func (c *Controller) Stop() {
	c.lifecycleMu.Lock()
	defer c.lifecycleMu.Unlock()
	for _, id := range c.workers.StopAll() {
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: ato controller. Failed to save usage. Error:", err)
		}
		log.Println("ato subsystem: Saved usage data of sensor:", id)
	}
}

// Worker lifecycle helpers must be called with lifecycleMu held. The worker
// itself does not acquire lifecycleMu when exiting, so joining here cannot
// block on the debounce mutex or the lifecycle mutex.
func (c *Controller) startWorkerLocked(a ATO) {
	c.workers.Start(a.ID, func(quit <-chan struct{}) {
		if c.workerRunner != nil {
			_ = c.workerRunner(a, quit)
		} else {
			_ = c.run(a, quit, true)
		}
	})
}

func (c *Controller) stopWorkerLocked(id string) bool {
	return c.workers.Stop(id)
}

func (c *Controller) replaceWorkerLocked(a ATO) {
	c.stopWorkerLocked(a.ID)
	if a.Enable {
		c.startWorkerLocked(a)
	}
}

func (c *Controller) Control(a ATO, reading int) error {
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
	switch depType {
	case storage.EquipmentBucket:
		return c.inUseBy(func(a ATO) bool {
			return a.Pump == id && !a.IsMacro
		})
	case storage.InletBucket:
		return c.inUseBy(func(a ATO) bool {
			return a.Inlet == id
		})
	case storage.MacroBucket:
		return c.inUseBy(func(a ATO) bool {
			return a.IsMacro && a.Pump == id
		})
	default:
		return nil, fmt.Errorf("unknown dependency type:%s", depType)
	}
}

func (c *Controller) GetEntity(id string) (controller.Entity, error) {
	return c.Get(id)
}
