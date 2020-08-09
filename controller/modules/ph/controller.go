package ph

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.PhBucket
const CalibrationBucket = storage.PhCalibrationBucket

type Controller struct {
	sync.Mutex
	c           controller.Controller
	quitters    map[string]chan struct{}
	statsMgr    telemetry.StatsManager
	devMode     bool
	ais         *connectors.AnalogInputs
	calibrators map[string]hal.Calibrator
}

func New(devMode bool, c controller.Controller) *Controller {
	return &Controller{
		quitters:    make(map[string]chan struct{}),
		c:           c,
		devMode:     devMode,
		ais:         c.DM().AnalogInputs(),
		statsMgr:    c.Telemetry().NewStatsManager(ReadingsBucket),
		calibrators: make(map[string]hal.Calibrator),
	}
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	if err := c.c.Store().CreateBucket(CalibrationBucket); err != nil {
		return err
	}

	err := c.c.Store().List(CalibrationBucket, func(k string, v []byte) error {
		var ms []hal.Measurement
		if err := json.Unmarshal(v, &ms); err != nil {
			return err
		}
		c.Lock()
		defer c.Unlock()

		calibrator, err := hal.CalibratorFactory(ms)
		if err == nil {
			c.calibrators[k] = calibrator
		}
		return err
	})
	if err != nil {
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

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	switch depType {
	case storage.EquipmentBucket:
		probes, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, p := range probes {
			if p.UpperEq == id && !p.IsMacro {
				deps = append(deps, p.Name)
			}
		}
		for _, p := range probes {
			if p.DownerEq == id && !p.IsMacro {
				deps = append(deps, p.Name)
			}
		}
		return deps, nil
	case storage.AnalogInputBucket:
		probes, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, p := range probes {
			if p.AnalogInput == id {
				deps = append(deps, p.Name)
			}
		}
		return deps, nil
	case storage.MacroBucket:
		probes, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, p := range probes {
			if p.UpperEq == id && p.IsMacro {
				deps = append(deps, p.Name)
			}
		}
		for _, p := range probes {
			if p.DownerEq == id && p.IsMacro {
				deps = append(deps, p.Name)
			}
		}
		return deps, nil
	default:
		return deps, fmt.Errorf("unknown dependency type:%s", depType)
	}
}
