package timer

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	cron "github.com/robfig/cron/v3"

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
	case "equipment":
		var ue UpdateEquipment
		if err := json.Unmarshal(j.Target, &ue); err != nil {
			return nil, err
		}
		eq, err := c.equipment.Get(ue.ID)
		if err != nil {
			return nil, err
		}
		if eq.Outlet == "" {
			return nil, fmt.Errorf("Equipment: %s does not have associated outlet", eq.Name)
		}
		return &EquipmentRunner{
			eq:        eq,
			target:    ue,
			equipment: c.equipment,
		}, nil
	case "macro":
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
