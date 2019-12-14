package temperature

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"

	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

const Bucket = storage.TemperatureBucket
const UsageBucket = storage.TemperatureUsageBucket

type Controller struct {
	sync.Mutex
	c         controller.Controller
	devMode   bool
	equipment *equipment.Controller
	quitters  map[string]chan struct{}
	statsMgr  telemetry.StatsManager
	tcs       map[string]*TC
}

func New(devMode bool, c controller.Controller, eqs *equipment.Controller) (*Controller, error) {
	return &Controller{
		c:         c,
		devMode:   devMode,
		equipment: eqs,
		quitters:  make(map[string]chan struct{}),
		tcs:       make(map[string]*TC),
		statsMgr:  c.Telemetry().NewStatsManager(UsageBucket),
	}, nil
}

func (c *Controller) Setup() error {
	c.Lock()
	defer c.Unlock()
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	if err := c.c.Store().CreateBucket(UsageBucket); err != nil {
		return err
	}
	tcs, err := c.List()
	if err != nil {
		return err
	}
	for i, tc := range tcs {
		c.tcs[tc.ID] = &tcs[i]
	}
	return nil
}

func (c *Controller) Start() {
	c.Lock()
	defer c.Unlock()
	for _, t := range c.tcs {
		if !t.Enable {
			continue
		}
		fn := func(d json.RawMessage) interface{} {
			var u controller.Observation
			json.Unmarshal(d, &u)
			return u
		}
		if err := c.statsMgr.Load(t.ID, fn); err != nil {
			log.Println("ERROR: temperature subsystem. Failed to load usage. Error:", err)
		}
		quit := make(chan struct{})
		c.quitters[t.ID] = quit
		go c.Run(t, quit)
	}
}
func (c *Controller) Stop() {
	for id, quit := range c.quitters {
		close(quit)
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: temperature controller. Failed to save usage. Error:", err)
		}
		log.Println("temperature sub-system: Saved usage data of sensor:", id)
		delete(c.quitters, id)
	}
}

func (c *Controller) On(id string, on bool) error {
	tc, err := c.Get(id)
	if err != nil {
		return err
	}
	tc.Enable = on
	return c.Update(id, tc)
}
