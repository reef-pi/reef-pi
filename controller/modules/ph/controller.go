package ph

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.PhBucket
const CalibrationBucket = storage.PhCalibrationBucket

type Controller struct {
	c        controller.Controller
	quitters map[string]chan struct{}
	mu       *sync.Mutex
	statsMgr telemetry.StatsManager
	devMode  bool
	ais      *connectors.AnalogInputs
}

func New(devMode bool, c controller.Controller, ais *connectors.AnalogInputs) *Controller {
	return &Controller{
		quitters: make(map[string]chan struct{}),
		c:        c,
		devMode:  devMode,
		mu:       &sync.Mutex{},
		ais:      ais,
		statsMgr: c.Telemetry().NewStatsManager(ReadingsBucket),
	}
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	if err := c.c.Store().CreateBucket(CalibrationBucket); err != nil {
		return err
	}
	return c.c.Store().CreateBucket(ReadingsBucket)
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
			u := controller.Observation{}
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
