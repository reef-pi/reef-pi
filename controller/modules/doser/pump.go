package doser

import (
	"encoding/json"
	"fmt"
	"log"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

//swagger:model dosingRegiment
type DosingRegiment struct {
	Enable   bool     `json:"enable"`
	Schedule Schedule `json:"schedule"`
	Duration float64  `json:"duration"`
	Speed    float64  `json:"speed"`
	Volume   float64  `json:"volume"`
}

// swagger:model pump
type Pump struct {
	ID       string         `json:"id"`
	Name     string         `json:"name"`
	Jack     string         `json:"jack"`
	Pin      int            `json:"pin"`
	Regiment DosingRegiment `json:"regiment"`
	Stepper  *DRV8825       `json:"stepper"`
	Type     string         `json:"type"`
}

func (p *Pump) IsValid() error {
	if p.Name == "" {
		return fmt.Errorf("name can not be empty")
	}
	switch p.Type {
	case "stepper":
		if p.Regiment.Volume <= 0 {
			return fmt.Errorf("dosing volume must be positive")
		}
		if p.Stepper == nil {
			return fmt.Errorf("stepper configuration is not defined")
		}
		if err := p.Stepper.IsValid(); err != nil {
			return err
		}
	default:
		if p.Jack == "" {
			return fmt.Errorf("jack is not defined")
		}
		if p.Regiment.Duration < 0 {
			return fmt.Errorf("Invalid Duration")
		}
	}
	return p.Regiment.Schedule.Validate()
}

func (c *Controller) Get(id string) (Pump, error) {
	var p Pump
	return p, c.c.Store().Get(Bucket, id, &p)
}

func (c *Controller) Create(p Pump) error {
	if err := p.IsValid(); err != nil {
		return err
	}
	fn := func(id string) interface{} {
		p.ID = id
		return &p
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return err
	}
	c.statsMgr.Initialize(p.ID)
	if p.Regiment.Enable {
		return c.addToCron(p)
	}
	return nil
}

func (c *Controller) List() ([]Pump, error) {
	pumps := []Pump{}
	fn := func(_ string, v []byte) error {
		var p Pump
		if err := json.Unmarshal(v, &p); err != nil {
			return err
		}
		pumps = append(pumps, p)
		return nil
	}
	return pumps, c.c.Store().List(Bucket, fn)
}

//swagger:model doserCalibrationDetails
type CalibrationDetails struct {
	Speed    float64 `json:"speed"`
	Duration float64 `json:"duration"`
	Volume   float64 `json:"volume"`
}

func (c *Controller) Calibrate(id string, cal CalibrationDetails) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	r := &Runner{
		pump: &p,
		dm:   c.c.DM(),
	}
	log.Println("doser subsystem: calibration run for:", p.Name)
	if p.Stepper != nil {
		go p.Stepper.Dose(c.c.DM().Outlets(), cal.Volume)
	} else {
		go r.PWMDose(cal.Speed, cal.Duration)
	}
	return nil
}

func (c *Controller) Update(id string, p Pump) error {
	if err := p.IsValid(); err != nil {
		return err
	}
	p.ID = id
	if err := c.c.Store().Update(Bucket, id, p); err != nil {
		return err
	}
	c.mu.Lock()
	if cID, ok := c.cronIDs[id]; ok {
		log.Printf("doser sub-system. Removing cron entry %d for pump id: %s.\n", cID, id)
		c.runner.Remove(cID)
	}
	c.mu.Unlock()
	if p.Regiment.Enable {
		return c.addToCron(p)
	}
	return nil
}

func (c *Controller) Schedule(id string, r DosingRegiment) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	p.Regiment = r
	if err := c.Update(id, p); err != nil {
		return err
	}
	c.mu.Lock()
	if cID, ok := c.cronIDs[id]; ok {
		log.Printf("doser sub-system. Removing cron entry %d for pump id: %s.\n", cID, id)
		c.runner.Remove(cID)
	}
	c.mu.Unlock()
	if p.Regiment.Enable {
		return c.addToCron(p)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if cID, ok := c.cronIDs[id]; ok {
		log.Printf("doser sub-system. Removing cron entry %d for pump id: %s.\n", cID, id)
		c.runner.Remove(cID)
	}
	return c.c.Store().Delete(Bucket, id)
}

func (p *Pump) Runner(dm *device_manager.DeviceManager, t telemetry.StatsManager) cron.Job {
	return &Runner{
		dm:       dm,
		statsMgr: t,
		pump:     p,
	}
}
