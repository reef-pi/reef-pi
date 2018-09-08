package temperature

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/equipment"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
)

const Bucket = types.TemperatureBucket
const UsageBucket = types.TemperatureUsageBucket

type Controller struct {
	sync.Mutex
	c         types.Controller
	devMode   bool
	equipment *equipment.Controller
	quitters  map[string]chan struct{}
	statsMgr  types.StatsManager
}

func New(devMode bool, c types.Controller, eqs *equipment.Controller) (*Controller, error) {
	return &Controller{
		c:         c,
		devMode:   devMode,
		equipment: eqs,
		quitters:  make(map[string]chan struct{}),
		statsMgr: utils.NewStatsManager(
			c.Store(),
			UsageBucket,
			types.CurrentLimit,
			types.HistoricalLimit),
	}, nil
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	if err := c.c.Store().CreateBucket(UsageBucket); err != nil {
		return err
	}
	return nil
}

func (c *Controller) Start() {
	c.Lock()
	defer c.Unlock()
	tcs, err := c.List()
	if err != nil {
		log.Println("ERROR: temperature subsystem: Failed to list sensors. Error:", err)
		return
	}
	for _, t := range tcs {
		if !t.Enable {
			continue
		}
		fn := func(d json.RawMessage) interface{} {
			u := Usage{}
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
