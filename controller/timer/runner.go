package timer

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/equipment"
	"log"
)

type JobRunner struct {
	eq        equipment.Equipment
	equipment *equipment.Controller
}

func (r *JobRunner) Run() {
	if err := r.equipment.Update(r.eq.ID, r.eq); err != nil {
		log.Println("ERROR: timer sub-system, Failed to update equipment. Error:", err)
	}
}

func (c *Controller) Runner(eqID string, eqState bool) (*JobRunner, error) {
	eq, err := c.equipment.Get(eqID)
	if err != nil {
		return nil, err
	}
	if eq.Outlet == "" {
		return nil, fmt.Errorf("Equipment: %s does not have associated outlet", eq.Name)
	}
	eq.On = eqState
	return &JobRunner{
		eq:        eq,
		equipment: c.equipment,
	}, nil
}
