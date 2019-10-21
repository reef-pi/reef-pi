package pwm_profile

import (
	"encoding/json"
	"fmt"
	"math"
	"time"
)

type CompositeProfile struct {
	Type   string          `json:"type"`
	Span   int             `json:"span"`
	Config json.RawMessage `json:"config"`
	Min    float64         `json:"min"`
	Max    float64         `json:"max"`
}

type composite struct {
	start    time.Time
	total    int
	profiles []TemporalProfile
	Profiles []CompositeProfile `json:"profiles"`
}

func (c *composite) Name() string {
	return _compositeProfileName
}

func Composite(conf json.RawMessage, t time.Time) (*composite, error) {
	var comp composite
	if err := json.Unmarshal(conf, &comp); err != nil {
		return nil, err
	}
	comp.start = t
	start := t
	for _, spec := range comp.Profiles {
		comp.total += spec.Span
		end := start.Add(time.Duration(spec.Span) * time.Second)
		p, err := NewTemporal(start.Format(tFormat), end.Format(tFormat), spec.Min, spec.Max)
		if err != nil {
			return nil, err
		}
		switch spec.Type {
		case _diurnalProfileName:
			comp.profiles = append(comp.profiles, &diurnal{p})
		case _sineProfileName:
			comp.profiles = append(comp.profiles, &sine{p})
		case _fixedProfileName:
			var f fixed
			if err := json.Unmarshal(spec.Config, &f); err != nil {
				return nil, err
			}
			f.temporal = p
			comp.profiles = append(comp.profiles, &f)
		case _randomProfileName:
			comp.profiles = append(comp.profiles, NewRandom(p))
		case _intervalProfileName:
			var i interval
			if err := json.Unmarshal(spec.Config, &i); err != nil {
				return nil, err
			}
			i.temporal = p
			if err := i.Validate(); err != nil {
				return nil, err
			}
			comp.profiles = append(comp.profiles, &i)
		default:
			return nil, fmt.Errorf("unsupported sub-profile:%s", spec.Type)
		}
		start = end
	}
	return &comp, nil
}

func (c *composite) Get(t time.Time) float64 {
	remainder := math.Mod(t.Sub(c.start).Seconds(), float64(c.total))
	aT := c.start.Add(time.Duration(remainder) * time.Second)
	for _, p := range c.profiles {
		if p.IsOutside(aT) {
			continue
		}
		return p.Get(aT)
	}
	return 0
}
