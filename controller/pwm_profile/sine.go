package pwm_profile

import (
	"encoding/json"
	"math"
	"time"
)

type sine struct {
	temporal
}

func (s *sine) Name() string {
	return _sineProfileName
}

func Sine(conf json.RawMessage, min, max float64) (*sine, error) {
	d, err := Temporal(conf, min, max)
	if err != nil {
		return nil, err
	}
	s := sine{d}
	return &s, nil
}

func (s *sine) Get(t time.Time) float64 {
	if s.IsOutside(t) {
		return 0
	}
	v := math.Sin(math.Pi * s.PastSeconds(t) / s.TotalSeconds())
	return s.min + (v * (s.max - s.min))
}
