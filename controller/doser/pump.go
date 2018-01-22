package doser

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"gopkg.in/robfig/cron.v2"
	"log"
)

func (c *Controller) Get(id string) (Pump, error) {
	var p Pump
	return p, c.store.Get(Bucket, id, &p)
}

func (c *Controller) Create(p Pump) error {
	fn := func(id string) interface{} {
		p.ID = id
		return &p
	}
	return c.store.Create(Bucket, fn)
}

func (c *Controller) List() ([]Pump, error) {
	pumps := []Pump{}
	fn := func(v []byte) error {
		var p Pump
		if err := json.Unmarshal(v, &p); err != nil {
			return err
		}
		pumps = append(pumps, p)
		return nil
	}
	return pumps, c.store.List(Bucket, fn)
}

func (c *Controller) Calibrate(id string, cal CalibrationDetails) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	// TODO implement calibration logic
	p.ID = ""
	return nil
}

func (c *Controller) Update(id string, p Pump) error {
	p.ID = id
	if err := c.store.Update(Bucket, id, p); err != nil {
		return err
	}
	// TODO cross check cron assignment
	return nil
}

func (c *Controller) Schedule(id string, sc DosingSchedule) error {
	if err := sc.Schedule.Validate(); err != nil {
		return err
	}
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	p.Schedule = sc
	if err := c.Update(id, p); err != nil {
		return err
	}
	// Add to cron if enabled
	if p.Schedule.Enable {
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.store.Delete(Bucket, id); err != nil {
		return nil
	}
	// TODO remove from cron if enabled
	return nil
}

func (p *Pump) Runner(vv utils.VariableVoltage) cron.Job {
	return &Runner{
		pin:      p.Pin,
		duration: p.Schedule.Duration,
		speed:    p.Schedule.Speed,
		vv:       vv,
	}
}

func (c *Controller) addToCron(p Pump) error {
	cronID, err := c.runner.AddJob(p.Schedule.Schedule.CronSpec(), p.Runner(c.vv))
	if err != nil {
		return err
	}
	log.Println("Successfully added cron entry. ID:", cronID)
	c.cronIDs[p.ID] = cronID
	return nil
}
