package timer

import (
	"fmt"
)

type JobRunner struct {
	c      *Controller
	outlet string
	on     bool
	value  int
}

func (r *JobRunner) Run() {
	/*
		if err := r.c.ConfigureOutlet(r.outlet, r.on, r.value); err != nil {
			log.Println("ERROR:", err)
		}
	*/
}

func (c *Controller) Runner(job Job) (*JobRunner, error) {
	eq, err := c.equipments.Get(job.Equipment)
	if err != nil {
		return nil, err
	}
	if eq.Outlet == "" {
		return nil, fmt.Errorf("Equipment: %s does not have associated outlet", eq.Name)
	}
	return &JobRunner{
		outlet: eq.Outlet,
		c:      c,
		on:     job.On,
		value:  job.Value,
	}, nil
}
