package timer

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"gopkg.in/robfig/cron.v2"
	"log"
	"time"
)

type UpdateEquipment struct {
	Revert   bool          `json:"revert"`
	ID       string        `json:"id"`
	On       bool          `json:"on"`
	Duration time.Duration `json:"duration"`
}
type EquipmentRunner struct {
	eq         equipments.Equipment
	target     UpdateEquipment
	equipments *equipments.Controller
}

func (e *EquipmentRunner) Run() {
	eq := e.eq
	eq.On = e.target.On
	if err := e.equipments.Update(e.eq.ID, eq); err != nil {
		log.Println("ERROR: timer sub-system, Failed to update equipment. Error:", err)
	}
	if e.target.Revert {
		select {
		case <-time.After(e.target.Duration * time.Second):
			eq.On = !e.target.On
			if err := e.equipments.Update(e.eq.ID, eq); err != nil {
				log.Println("ERROR: timer sub-system, Failed to revert equipment. Error:", err)
			}
		}
	}
}

func (c *Controller) Runner(j Job) (cron.Job, error) {
	switch j.Type {
	case "equipment":
		eq, err := c.equipments.Get(j.Equipment.ID)
		if err != nil {
			return nil, err
		}
		if eq.Outlet == "" {
			return nil, fmt.Errorf("Equipment: %s does not have associated outlet", eq.Name)
		}
		return &EquipmentRunner{
			eq:         eq,
			target:     j.Equipment,
			equipments: c.equipments,
		}, nil
	case "reminder":
		return &ReminderRunner{
			telemetry: c.telemetry,
			title:     "[Reef-Pi Reminder]" + j.Reminder.Title,
			body:      j.Reminder.Message,
		}, nil
	default:
	}
	return nil, fmt.Errorf("Failed to find suitable job runner")
}
