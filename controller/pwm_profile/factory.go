package pwm_profile

import (
	"encoding/json"
	"fmt"
	"time"
)

const (
	_loopProfileName      = "loop"
	_fixedProfileName     = "fixed"
	_autoProfileName      = "auto"
	_diurnalProfileName   = "diurnal"
	_compositeProfileName = "composite"
	_lunarProfileName     = "lunar"
	_intervalProfileName  = "interval"
	_sineProfileName      = "sine"
	_randomProfileName    = "random"
)

type Profile interface {
	Get(time.Time) float64
	Name() string
}

type TemporalProfile interface {
	Profile
	IsOutside(time.Time) bool
	AdjustBounds(min, max float64) (updated bool)
}

type ProfileSpec struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
	Min    float64         `json:"min"`
	Max    float64         `json:"max"`
}

func (p *ProfileSpec) CreateProfile() (Profile, error) {
	switch p.Type {
	case _loopProfileName:
		return Loop(p.Config)
	case _fixedProfileName:
		return Fixed(p.Config, p.Min, p.Max)
	case _autoProfileName:
		return Auto(p.Config, p.Min, p.Max)
	case _diurnalProfileName:
		return Diurnal(p.Config, p.Min, p.Max)
	case _compositeProfileName:
		return Composite(p.Config, time.Now(), p.Min, p.Max)
	case _lunarProfileName:
		return Lunar(p.Config, p.Min, p.Max)
	case _intervalProfileName:
		return Interval(p.Config, p.Min, p.Max)
	case _sineProfileName:
		return Sine(p.Config, p.Min, p.Max)
	case _randomProfileName:
		return Random(p.Config, p.Min, p.Max)
	default:
		return nil, fmt.Errorf("unknown profile type: %s", p.Type)
	}
}
