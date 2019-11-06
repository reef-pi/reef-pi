package doser

import (
	"encoding/json"
	"fmt"
	"log"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Pump struct {
	ID       string         `json:"id"`
	Name     string         `json:"name"`
	Jack     string         `json:"jack"`
	Pin      int            `json:"pin"`
	Regiment DosingRegiment `json:"regiment"`
}

func (c *Controller) Get(id string) (Pump, error) {
	var p Pump
	return p, c.c.Store().Get(Bucket, id, &p)
}

func (c *Controller) Create(p Pump) error {
	if err := Validate(p); err != nil {
		return err
	}
	fn := func(id string) interface{} {
		p.ID = id
		return &p
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return err
	}
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

func (c *Controller) Calibrate(id string, cal CalibrationDetails) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	r := &Runner{
		pump:  &p,
		jacks: c.jacks,
	}
	log.Println("doser subsystem: calibration run for:", p.Name)
	go r.Dose(cal.Speed, cal.Duration)
	return nil
}

func (c *Controller) Update(id string, p Pump) error {
	if err := Validate(p); err != nil {
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

func Validate(p Pump) error {
	if p.Regiment.Duration < 0 {
		return fmt.Errorf("Invalid Duration")
	}
	return nil
}

func (c *Controller) Schedule(id string, r DosingRegiment) error {
	log.Println(r)
	if err := r.Schedule.Validate(); err != nil {
		log.Printf("CronSpec:'%s'\n", r.Schedule.CronSpec())
		return err
	}
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

func (p *Pump) Runner(jacks *connectors.Jacks, t telemetry.StatsManager) cron.Job {
	return &Runner{
		pump:     p,
		jacks:    jacks,
		statsMgr: t,
	}
}
