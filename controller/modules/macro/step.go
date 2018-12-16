package macro

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"time"
)

var stepTypes = []string{
	"wait",
	"subsystem",
	"macro",
	"equipment",
	"ato",
	"tc",
	"lighting",
	"ph",
	"doser",
	"timer",
}

type GenericStep struct {
	ID string `json:"id"`
	On bool   `json:"on"`
}

type WaitStep struct {
	Duration time.Duration `json:"duration"`
}

type Step struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

func (s *Step) Run(c controller.Controller) error {
	switch s.Type {
	case storage.EquipmentBucket, storage.ATOBucket, storage.TemperatureBucket,
		storage.DoserBucket, storage.PhBucket, storage.TimerBucket:
		var g GenericStep
		if err := json.Unmarshal(s.Config, &g); err != nil {
			return err
		}
		sub, err := c.Subsystem(s.Type)
		if err != nil {
			return err
		}
		return sub.On(g.ID, g.On)
	case "subsystem":
		var g GenericStep
		if err := json.Unmarshal(s.Config, &g); err != nil {
			return err
		}
		sub, err := c.Subsystem(g.ID)
		if err != nil {
			return err
		}
		if g.On {
			sub.Start()
			return nil
		} else {
			sub.Stop()
			return nil
		}
	case "wait":
		var w WaitStep
		if err := json.Unmarshal(s.Config, &w); err != nil {
			return err
		}
		time.Sleep(w.Duration * time.Second)
		return nil
	default:
		return fmt.Errorf("Unknown step type:%s", s.Type)
	}
}
