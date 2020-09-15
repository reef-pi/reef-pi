package temperature

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.TemperatureBucket
const UsageBucket = storage.TemperatureUsageBucket
const CalibrationBucket = storage.TemperatureCalibrationBucket

type Controller struct {
	sync.Mutex
	c           controller.Controller
	devMode     bool
	quitters    map[string]chan struct{}
	statsMgr    telemetry.StatsManager
	tcs         map[string]*TC
	calibrators map[string]hal.Calibrator
}

func New(devMode bool, c controller.Controller) (*Controller, error) {
	return &Controller{
		c:           c,
		devMode:     devMode,
		quitters:    make(map[string]chan struct{}),
		tcs:         make(map[string]*TC),
		calibrators: make(map[string]hal.Calibrator),
		statsMgr:    c.Telemetry().NewStatsManager(UsageBucket),
	}, nil
}

func (c *Controller) Setup() error {
	c.Lock()
	defer c.Unlock()
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	if err := c.c.Store().CreateBucket(CalibrationBucket); err != nil {
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

	err = c.c.Store().List(CalibrationBucket, func(k string, v []byte) error {
		var ms []hal.Measurement
		if err := json.Unmarshal(v, &ms); err != nil {
			return err
		}
		calibrator, err := hal.CalibratorFactory(ms)
		if err == nil {
			c.calibrators[k] = calibrator
		}
		return err
	})

	return err
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
	c.Lock()
	defer c.Unlock()
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
	tc.SetEnable(on)
	if on && tc.OneShot {
		q := make(chan struct{})
		defer close(q)
		return c.Run(tc, q)
	}
	return c.Update(id, tc)
}

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	return deps, nil
}
