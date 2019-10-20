package pwm_profile

import (
	"encoding/json"
	"math"
	"time"
)

type CompositeProfile struct {
	Type   string          `json:"type"`
	Span   int             `json:"span"`
	Config json.RawMessage `json:"config"`
}

type composite struct {
	start    time.Time
	total    int
	min, max float64
	profiles []TemporalProfile
	Profiles []CompositeProfile `json:"profiles"`
}

func Composite(conf json.RawMessage, t time.Time, min, max float64) (*composite, error) {
	var comp composite
	if err := json.Unmarshal(conf, &comp); err != nil {
		return nil, err
	}
	comp.start = t
	comp.min = min
	comp.max = max

	start := t
	for _, spec := range comp.Profiles {
		comp.total += spec.Span
		end := start.Add(time.Duration(spec.Span) * time.Second)
		p, err := NewTemporal(start.Format(tFormat), end.Format(tFormat), min, max)
		if err != nil {
			return nil, err
		}
		switch spec.Type {
		case "diurnal":
			comp.profiles = append(comp.profiles, &diurnal{p})
		case "sine":
			comp.profiles = append(comp.profiles, &sine{p})
		case "fixed":
			var f fixed
			if err := json.Unmarshal(spec.Config, &f); err != nil {
				return nil, err
			}
			f.temporal = p

			comp.profiles = append(comp.profiles, &f)
		case "random":
			comp.profiles = append(comp.profiles, NewRandom(p))
		case "arbitrary_interval":
			var i interval
			if err := json.Unmarshal(spec.Config, &i); err != nil {
				return nil, err
			}
			i.temporal = p
			if err := i.Validate(); err != nil {
				return nil, err
			}
			comp.profiles = append(comp.profiles, &i)
		}
		start = end
	}
	return &comp, nil
}

func (c *composite) Get(t time.Time) float64 {
	aT := c.start.Add(time.Duration(math.Mod(t.Sub(c.start).Seconds(), float64(c.total))))
	for _, p := range c.profiles {
		if p.IsOutside(aT) {
			continue
		}
		return p.Get(aT)
	}
	return 0
}
