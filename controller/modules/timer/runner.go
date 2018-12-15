package timer

import (
	"fmt"
	"log"
	"time"

	cron "gopkg.in/robfig/cron.v2"

	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

type UpdateEquipment struct {
	Revert   bool          `json:"revert"`
	ID       string        `json:"id"`
	On       bool          `json:"on"`
	Duration time.Duration `json:"duration"`
}
type EquipmentRunner struct {
	eq        equipment.Equipment
	target    UpdateEquipment
	equipment *equipment.Controller
}

func (e *EquipmentRunner) Run() {
	eq := e.eq
	eq.On = e.target.On
	if err := e.equipment.Update(e.eq.ID, eq); err != nil {
		log.Println("ERROR: timer sub-system, Failed to update equipment. Error:", err)
	}
	if e.target.Revert {
		select {
		case <-time.After(e.target.Duration * time.Second):
			eq.On = !e.target.On
			if err := e.equipment.Update(e.eq.ID, eq); err != nil {
				log.Println("ERROR: timer sub-system, Failed to revert equipment. Error:", err)
			}
		}
	}
}

func (c *Controller) Runner(j Job) (cron.Job, error) {
	switch j.Type {
	case "equipment":
		eq, err := c.equipment.Get(j.Equipment.ID)
		if err != nil {
			return nil, err
		}
		if eq.Outlet == "" {
			return nil, fmt.Errorf("Equipment: %s does not have associated outlet", eq.Name)
		}
		return &EquipmentRunner{
			eq:        eq,
			target:    j.Equipment,
			equipment: c.equipment,
		}, nil
	case "reminder":
		return &ReminderRunner{
			telemetry: c.c.Telemetry(),
			title:     "[Reef-Pi Reminder]" + j.Reminder.Title,
			body:      j.Reminder.Message,
		}, nil
	default:
	}
	return nil, fmt.Errorf("Failed to find suitable job runner")
}
