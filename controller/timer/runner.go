package timer

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"log"
)

type JobRunner struct {
	eq         equipments.Equipment
	equipments *equipments.Controller
}

func (r *JobRunner) Run() {
	if err := r.equipments.Update(r.eq.ID, r.eq); err != nil {
		log.Println("ERROR:", err)
	}
}

func (c *Controller) Runner(job Job) (*JobRunner, error) {
	eq, err := c.equipments.Get(job.Equipment)
	if err != nil {
		return nil, err
	}
	eq.ID = job.Equipment
	if eq.Outlet == "" {
		return nil, fmt.Errorf("Equipment: %s does not have associated outlet", eq.Name)
	}
	eq.On = job.On
	return &JobRunner{
		eq:         eq,
		equipments: c.equipments,
	}, nil
}
