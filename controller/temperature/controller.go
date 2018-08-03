package temperature

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
)

const Bucket = types.TemperatureBucket
const UsageBucket = types.TemperatureUsageBucket

type Controller struct {
	sync.Mutex
	telemetry  *utils.Telemetry
	store      utils.Store
	devMode    bool
	equipments *equipments.Controller
	quitters   map[string]chan struct{}
	statsMgr   *utils.StatsManager
}

func New(devMode bool, store utils.Store, telemetry *utils.Telemetry, eqs *equipments.Controller) (*Controller, error) {
	return &Controller{
		telemetry:  telemetry,
		store:      store,
		devMode:    devMode,
		equipments: eqs,
		quitters:   make(map[string]chan struct{}),
		statsMgr:   utils.NewStatsManager(store, UsageBucket, 180, 24*7),
	}, nil
}

func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	if err := c.store.CreateBucket(UsageBucket); err != nil {
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
