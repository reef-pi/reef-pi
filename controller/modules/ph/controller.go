package ph

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const Bucket = storage.PhBucket
const CalibrationBucket = storage.PhCalibrationBucket

type Controller struct {
	sync.Mutex
	lifecycleMu  sync.Mutex
	c            controller.Controller
	repo         repository
	workers      utils.KeyedWorkers
	statsMgr     telemetry.StatsManager
	devMode      bool
	ais          *connectors.AnalogInputs
	calibrators  map[string]hal.Calibrator
	pollerRunner func(Probe, <-chan struct{}) error
}

func New(devMode bool, c controller.Controller) *Controller {
	return &Controller{
		c:           c,
		repo:        newRepository(c.Store()),
		devMode:     devMode,
		ais:         c.DM().AnalogInputs(),
		statsMgr:    c.Telemetry().NewStatsManager(ReadingsBucket),
		calibrators: make(map[string]hal.Calibrator),
	}
}

func (c *Controller) Setup() error {
	if err := c.repo.Setup(); err != nil {
		return err
	}
	calibrations, err := c.repo.ListCalibrations()
	if err != nil {
		return err
	}
	for id, ms := range calibrations {
		c.Lock()

		var calibrator hal.Calibrator
		var cerr error
		if len(ms) == 3 {
			calibrator, cerr = newThreePointCalibrator(ms)
		} else {
			calibrator, cerr = hal.CalibratorFactory(ms)
		}
		if cerr == nil {
			c.calibrators[id] = calibrator
		}
		c.Unlock()
		if cerr != nil {
			return cerr
		}
	}
	return nil
}

func (c *Controller) Start() {
	c.lifecycleMu.Lock()
	defer c.lifecycleMu.Unlock()
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
		c.replacePollerLocked(p)
	}
}

func (c *Controller) Stop() {
	c.lifecycleMu.Lock()
	defer c.lifecycleMu.Unlock()
	for _, id := range c.workers.StopAll() {
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: ph controller. Failed to save usage. Error:", err)
		}
		log.Println("ph subsystem: Saved usage data of sensor:", id)
	}
}

// replacePollerLocked must be called with lifecycleMu held. It never holds
// the controller mutex while joining a worker, since workers use that mutex
// while recording readings and applying control actions.
func (c *Controller) replacePollerLocked(p Probe) {
	c.workers.Stop(p.ID)
	if !p.Enable {
		return
	}
	c.workers.Start(p.ID, func(quit <-chan struct{}) {
		var err error
		if c.pollerRunner != nil {
			err = c.pollerRunner(p, quit)
		} else {
			err = c.run(p, quit, true)
		}
		if err != nil {
			log.Println("ERROR: ph subsystem: poller exited with error:", err)
		}
	})
}

func (c *Controller) On(id string, b bool) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	p.Enable = b
	if b && p.OneShot {
		q := make(chan struct{})
		defer close(q)
		return c.Run(p, q)
	}
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
func (c *Controller) GetEntity(id string) (controller.Entity, error) {
	return nil, fmt.Errorf("ph subsystem does not support 'GetEntity' interface")
}
