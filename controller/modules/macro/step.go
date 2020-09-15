package macro

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
)

type GenericStep struct {
	ID string `json:"id"`
	On bool   `json:"on"`
}

type WaitStep struct {
	Duration time.Duration `json:"duration"`
}
type AlertStep struct {
	Title   string `json:"title"`
	Message string `json:"message"`
}

type Step struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

func (s *Step) Run(c controller.Controller, reverse bool) error {
	switch s.Type {
	case storage.EquipmentBucket, storage.ATOBucket, storage.TemperatureBucket,
		storage.DoserBucket, storage.PhBucket, storage.TimerBucket, storage.MacroBucket, "subsystem":
		var g GenericStep
		if err := json.Unmarshal(s.Config, &g); err != nil {
			return err
		}
		state := g.On
		if reverse {
			state = !state
		}
		if s.Type == "subsystem" {
			sub, err := c.Subsystem(g.ID)
			if err != nil {
				return err
			}
			if state {
				sub.Start()
				return nil
			}
			sub.Stop()
			return nil
		}
		sub, err := c.Subsystem(s.Type)
		if err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: ", s.Type, "id:", g.ID, " state:", state)
		return sub.On(g.ID, state)
	case "wait":
		var w WaitStep
		if err := json.Unmarshal(s.Config, &w); err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: sleep for", int(w.Duration), "seconds")
		time.Sleep(w.Duration * time.Second)
		return nil
	case "alert":
		var a AlertStep
		if err := json.Unmarshal(s.Config, &a); err != nil {
			return err
		}
		log.Println("macro-subsystem: executing step: alert")
		_, err := c.Telemetry().Alert(a.Title, a.Message)
		return err
	default:
		return fmt.Errorf("Unknown step type:%s", s.Type)
	}
}
