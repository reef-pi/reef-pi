package doser

import (
	"fmt"
	"log"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

//swagger:model dosingRegiment
type DosingRegiment struct {
	Enable          bool     `json:"enable"`
	Schedule        Schedule `json:"schedule"`
	Duration        float64  `json:"duration"`
	Speed           float64  `json:"speed"`
	Volume          float64  `json:"volume"`
	VolumePerSecond float64  `json:"volume_per_second"`
	Continuous      bool     `json:"continuous"` // run at Speed% indefinitely without a schedule
	SoftStart       float64  `json:"soft_start"` // ramp duration in seconds (0 = disabled)
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
		return fmt.Errorf("name cannot be empty")
	}
	if p.Regiment.SoftStart < 0 {
		return fmt.Errorf("soft start must be non-negative")
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
		if p.Regiment.Continuous {
			return nil // continuous pumps need no schedule or duration
		}
		if p.Regiment.Duration < 0 {
			return fmt.Errorf("Invalid Duration")
		}
	}
	if p.Regiment.Continuous {
		return nil
	}
	return p.Regiment.Schedule.Validate()
}

func (c *Controller) Get(id string) (Pump, error) {
	return c.repo.Get(id)
}

func (c *Controller) Create(p Pump) error {
	if err := p.IsValid(); err != nil {
		return err
	}
	var err error
	p, err = c.repo.Create(p)
	if err != nil {
		return err
	}
	c.statsMgr.Initialize(p.ID)
	if p.Regiment.Enable {
		if p.Regiment.Continuous {
			c.startContinuous(p)
			return nil
		}
		return c.addToCron(p)
	}
	return nil
}

func (c *Controller) List() ([]Pump, error) {
	return c.repo.List()
}

//swagger:model doserCalibrationDetails
type CalibrationDetails struct {
	Speed    float64 `json:"speed"`
	Duration float64 `json:"duration"`
	Volume   float64 `json:"volume"`
}

// SaveCalibrationResult stores the mL/second ratio derived from a calibration run.
// After running the pump with Calibrate(), the user measures the actual volume dispensed
// and submits it here to compute VolumePerSecond = volume / duration.
func (c *Controller) SaveCalibrationResult(id string, cal CalibrationDetails) error {
	if cal.Duration <= 0 {
		return fmt.Errorf("calibration duration must be positive")
	}
	if cal.Volume <= 0 {
		return fmt.Errorf("calibration volume must be positive")
	}
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	p.Regiment.VolumePerSecond = cal.Volume / cal.Duration
	return c.repo.Update(id, p)
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
	if p.Type == "stepper" && p.Stepper != nil {
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
	if err := c.repo.Update(id, p); err != nil {
		return err
	}
	c.mu.Lock()
	if cID, ok := c.cronIDs[id]; ok {
		log.Printf("doser subsystem. Removing cron entry %d for pump id: %s.\n", cID, id)
		c.runner.Remove(cID)
		delete(c.cronIDs, id)
	}
	c.mu.Unlock()
	c.stopContinuous(id)
	if p.Regiment.Enable {
		if p.Regiment.Continuous {
			c.startContinuous(p)
			return nil
		}
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
	return c.Update(id, p)
}

func (c *Controller) Delete(id string) error {
	c.mu.Lock()
	if cID, ok := c.cronIDs[id]; ok {
		log.Printf("doser subsystem. Removing cron entry %d for pump id: %s.\n", cID, id)
		c.runner.Remove(cID)
		delete(c.cronIDs, id)
	}
	c.mu.Unlock()
	c.stopContinuous(id)
	return c.repo.Delete(id)
}

func (p *Pump) Runner(dm *device_manager.DeviceManager, t telemetry.Telemetry, sm telemetry.StatsManager) cron.Job {
	return &Runner{
		dm:       dm,
		statsMgr: sm,
		t:        t,
		pump:     p,
	}
}
