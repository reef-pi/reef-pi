package flow_meter

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.FlowMeterBucket
const UsageBucket = storage.FlowMeterUsageBucket

type Notify struct {
	Enable bool    `json:"enable"`
	Min    float64 `json:"min"` // minimum L/h before alert
}

// FlowMeter reads pulse counts from a file written by a GPIO counter process.
// Flow rate (L/h) = (delta_pulses / pulses_per_liter) * (3600 / period_seconds)
//
//swagger:model flowMeter
type FlowMeter struct {
	ID             string        `json:"id"`
	Name           string        `json:"name"`
	Enable         bool          `json:"enable"`
	Period         time.Duration `json:"period"`          // polling interval (stored as seconds)
	Sensor         string        `json:"sensor"`          // path to pulse-count file
	PulsesPerLiter float64       `json:"pulses_per_liter"` // calibration factor
	Notify         Notify        `json:"notify"`
}

func (f *FlowMeter) IsValid() error {
	if f.Name == "" {
		return fmt.Errorf("name cannot be empty")
	}
	if f.Sensor == "" {
		return fmt.Errorf("sensor path cannot be empty")
	}
	if f.PulsesPerLiter <= 0 {
		return fmt.Errorf("pulses_per_liter must be positive")
	}
	if f.Period <= 0 {
		f.Period = 60
	}
	return nil
}

type Controller struct {
	sync.Mutex
	c          controller.Controller
	devMode    bool
	quitters   map[string]chan struct{}
	wg         sync.WaitGroup
	statsMgr   telemetry.StatsManager
	lastCounts map[string]int64
}

func New(devMode bool, c controller.Controller) *Controller {
	return &Controller{
		c:          c,
		devMode:    devMode,
		quitters:   make(map[string]chan struct{}),
		lastCounts: make(map[string]int64),
		statsMgr:   c.Telemetry().NewStatsManager(UsageBucket),
	}
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	return c.c.Store().CreateBucket(UsageBucket)
}

func (c *Controller) Start() {
	fms, err := c.List()
	if err != nil {
		log.Println("ERROR: flow_meter subsystem: Failed to list flow meters. Error:", err)
		return
	}
	for _, f := range fms {
		if !f.Enable {
			continue
		}
		fn := func(d json.RawMessage) interface{} {
			u := controller.Observation{}
			json.Unmarshal(d, &u)
			return u
		}
		if err := c.statsMgr.Load(f.ID, fn); err != nil {
			log.Println("ERROR: flow_meter subsystem. Failed to load stats. Error:", err)
		}
		c.startPoller(f)
	}
}

func (c *Controller) Stop() {
	c.Lock()
	quitters := c.quitters
	c.quitters = make(map[string]chan struct{})
	c.Unlock()
	for id, quit := range quitters {
		close(quit)
		if err := c.statsMgr.Save(id); err != nil {
			log.Println("ERROR: flow_meter subsystem. Failed to save stats. Error:", err)
		}
	}
	c.wg.Wait()
}

func (c *Controller) On(id string, on bool) error {
	f, err := c.Get(id)
	if err != nil {
		return err
	}
	f.Enable = on
	return c.Update(id, f)
}

func (c *Controller) InUse(_, _ string) ([]string, error) {
	return nil, nil
}

func (c *Controller) GetEntity(id string) (controller.Entity, error) {
	return nil, fmt.Errorf("flow_meter subsystem does not support GetEntity")
}

func (c *Controller) Get(id string) (FlowMeter, error) {
	var f FlowMeter
	return f, c.c.Store().Get(Bucket, id, &f)
}

func (c *Controller) List() ([]FlowMeter, error) {
	fms := []FlowMeter{}
	fn := func(_ string, v []byte) error {
		var f FlowMeter
		if err := json.Unmarshal(v, &f); err != nil {
			return err
		}
		fms = append(fms, f)
		return nil
	}
	return fms, c.c.Store().List(Bucket, fn)
}

func (c *Controller) Create(f FlowMeter) error {
	if err := f.IsValid(); err != nil {
		return err
	}
	fn := func(id string) interface{} {
		f.ID = id
		return &f
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return err
	}
	c.statsMgr.Initialize(f.ID)
	if f.Enable {
		c.startPoller(f)
	}
	return nil
}

func (c *Controller) Update(id string, f FlowMeter) error {
	if err := f.IsValid(); err != nil {
		return err
	}
	f.ID = id
	if err := c.c.Store().Update(Bucket, id, f); err != nil {
		return err
	}
	c.stopPoller(id)
	if f.Enable {
		c.startPoller(f)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	c.stopPoller(id)
	return c.c.Store().Delete(Bucket, id)
}

func (c *Controller) startPoller(f FlowMeter) {
	quit := make(chan struct{})
	c.Lock()
	c.quitters[f.ID] = quit
	c.Unlock()
	c.wg.Add(1)
	go c.poll(f, quit)
}

func (c *Controller) stopPoller(id string) {
	c.Lock()
	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	c.Unlock()
}

func (c *Controller) poll(f FlowMeter, quit chan struct{}) {
	defer c.wg.Done()
	period := f.Period * time.Second
	if period <= 0 {
		period = 60 * time.Second
	}
	ticker := time.NewTicker(period)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			if err := c.readAndRecord(f); err != nil {
				log.Println("ERROR: flow_meter subsystem: Failed to poll", f.Name, ". Error:", err)
				c.c.LogError("flow_meter-"+f.ID, "Failed to poll "+f.Name+": "+err.Error())
			}
		case <-quit:
			return
		}
	}
}

func (c *Controller) readAndRecord(f FlowMeter) error {
	count, err := c.readPulseCount(f.Sensor)
	if err != nil {
		return err
	}

	c.Lock()
	last := c.lastCounts[f.ID]
	c.lastCounts[f.ID] = count
	c.Unlock()

	delta := count - last
	if delta < 0 {
		delta = 0
	}
	periodSec := float64(f.Period)
	if periodSec <= 0 {
		periodSec = 60
	}
	rate := (float64(delta) / f.PulsesPerLiter) * (3600.0 / periodSec)

	u := controller.Observation{
		Time:  telemetry.TeleTime(time.Now()),
		Value: rate,
	}
	c.statsMgr.Update(f.ID, u)
	c.statsMgr.Save(f.ID)
	c.c.Telemetry().EmitMetric("flow_meter", f.Name+"-lph", rate)
	log.Printf("flow_meter subsystem: %s: %.2f L/h\n", f.Name, rate)

	if f.Notify.Enable && rate < f.Notify.Min {
		subject := "[reef-pi] Low flow alert: " + f.Name
		body := fmt.Sprintf("Flow meter %q reading %.2f L/h is below minimum %.2f L/h", f.Name, rate, f.Notify.Min)
		c.c.Telemetry().Alert(subject, body)
	}
	return nil
}
