package controller

import (
	"fmt"
	"log"
)

type JobRunner struct {
	c      *Controller
	outlet string
	on     bool
	value  int
}

func (r *JobRunner) Run() {
	if err := r.c.ConfigureOutlet(r.outlet, r.on, r.value); err != nil {
		log.Println("ERROR:", err)
	}
}

func (c *Controller) Runner(job Job) (*JobRunner, error) {
	var e Equipment
	if err := c.store.Get("equipments", job.Equipment, &e); err != nil {
		return nil, err
	}
	if e.Outlet == "" {
		return nil, fmt.Errorf("Equipment: %s does not have associated outlet", e.Name)
	}
	return &JobRunner{
		outlet: e.Outlet,
		c:      c,
		on:     job.On,
		value:  job.Value,
	}, nil
}
