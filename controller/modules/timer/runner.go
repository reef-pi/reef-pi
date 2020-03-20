package timer

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	cron "github.com/robfig/cron/v3"
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
	target    UpdateEquipment
	equipment controller.Subsystem
}

func (e *EquipmentRunner) Run() {
	if err := e.equipment.On(e.target.ID, e.target.On); err != nil {
		log.Println("ERROR: timer sub-system, Failed to update equipment. Error:", err)
	}
	if e.target.Revert {
		select {
		case <-time.After(e.target.Duration * time.Second):
			if err := e.equipment.On(e.target.ID, !e.target.On); err != nil {
				log.Println("ERROR: timer sub-system, Failed to revert equipment. Error:", err)
			}
		}
	}
}

func (c *Controller) Runner(j Job) (cron.Job, error) {
	switch j.Type {
	case "reminder":
		var reminder Reminder
		if err := json.Unmarshal(j.Target, &reminder); err != nil {
			return nil, err
		}
		return &ReminderRunner{
			t:     c.c.Telemetry(),
			title: "[reef-pi Reminder]" + reminder.Title,
			body:  reminder.Message,
		}, nil
	case storage.EquipmentBucket:
		var ue UpdateEquipment
		if err := json.Unmarshal(j.Target, &ue); err != nil {
			return nil, err
		}
		return &EquipmentRunner{
			target:    ue,
			equipment: c.equipment,
		}, nil
	case storage.MacroBucket:
		var macro TriggerMacro
		if err := json.Unmarshal(j.Target, &macro); err != nil {
			return nil, err
		}
		return &MacroRunner{
			c:      c.macro,
			target: macro.ID,
		}, nil
	default:
		return nil, fmt.Errorf("Failed to find suitable job runner")
	}
}
