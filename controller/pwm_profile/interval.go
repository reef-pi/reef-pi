package pwm_profile

import (
	"encoding/json"
	"fmt"
	"time"
)

type interval struct {
	temporal
	Interval int       `json:"interval"`
	Values   []float64 `json:"values"`
}

func (i *interval) Get(t time.Time) float64 {
	if i.IsOutside(t) {
		return 0
	}
	past := i.PastMinutes(t)
	index := past / i.Interval
	v1 := i.Values[index]
	v2 := i.Values[index+1]
	incr := (v2 - v1) / float64(i.Interval)
	v := v1 + incr*float64(past%i.Interval)
	if v < i.min {
		return 0
	}
	if v > i.max {
		return i.max
	}
	return v
}

func Interval(conf json.RawMessage, min, max float64) (*interval, error) {
	var i interval
	if err := json.Unmarshal(conf, &i); err != nil {
		return nil, err
	}
	if err := i.Build(min, max); err != nil {
		return nil, err
	}
	if err := i.Validate(); err != nil {
		return nil, err
	}
	return &i, nil
}

func (i *interval) Validate() error {
	if i.Interval <= 0 {
		return fmt.Errorf("interval has to be positive")
	}
	l := len(i.Values)
	e := (i.TotalMinutes() / i.Interval) + 1
	if l != e {
		return fmt.Errorf("incorrect values. expected: %d provided:%d", e, l)
	}
	return nil
}
