package pwm_profile

import (
	"encoding/json"
	"math"
	"time"
)

type sine struct {
	diurnal
}

func Sine(conf json.RawMessage, min, max float64) (*sine, error) {
	d, err := Diurnal(conf, min, max)
	if err != nil {
		return nil, err
	}
	s := sine{*d}
	return &s, nil
}

func (s *sine) Get(t time.Time) float64 {
	start := time.Date(t.Year(), t.Month(), t.Day(), s.start.Hour(), s.start.Minute(), s.start.Second(), 0, t.Location())
	end := time.Date(t.Year(), t.Month(), t.Day(), s.end.Hour(), s.end.Minute(), s.end.Second(), 0, t.Location())
	if end.Before(start) {
		end = end.Add(time.Hour * 24)
		if t.Before(start) {
			t = t.Add(time.Hour * 24)
		}
	}
	if t.Before(start) {
		return 0
	}
	if t.After(end) {
		return 0
	}
	totalSeconds := float64(end.Sub(start) / time.Minute)
	pastSeconds := float64(t.Sub(start) / time.Minute)
	v := math.Sin(math.Pi * (pastSeconds / totalSeconds))
	return s.min + (v * (s.max - s.min))
}
