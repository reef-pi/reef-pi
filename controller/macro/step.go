package macro

import (
	"encoding/json"
	"time"
)

var stepTypes = []string{
	"equipment",
	"subsystem",
	"wait",
	"macro",
	"tc",
	"ato",
	"ph",
	"doser",
	"lighting",
	"timer",
}

type Onner interface {
	On(string, bool) error
}

type Controller interface {
	Module(string) (Onner, error)
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

func (s *Step) Run(c Controller) error {
	switch s.Type {
	case "equipment":
		var g GenericStep
		if err := json.Unmarshal(s.Config, &g); err != nil {
			return err
		}
		sub, err := c.Module("equipment")
		if err != nil {
			return err
		}
		return sub.On(g.ID, g.On)
	case "subsystem":
	case "wait":
	case "macro":
	case "temperature":
	case "ato":
	case "ph":
	case "doser":
	case "lighting":
	case "timer":
	default:
	}
	return nil
}
