package pwm_profile

import (
	"encoding/json"
	"fmt"
	"time"
)

type Profile interface {
	Get(time.Time) float64
}

type ProfileSpec struct {
	Name   string          `json:"name"`
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

func (p *ProfileSpec) CreateProfile() (Profile, error) {
	switch p.Type {
	case "manual":
		return Manual(p.Config)
	case "loop":
		return Loop(p.Config)
	case "auto":
		return Auto(p.Config)
	case "diurnal":
		return Diurnal(p.Config)
	case "composite":
		return Composite(p.Config)
	default:
		return nil, fmt.Errorf("unknown profile type: %s", p.Type)
	}
}
