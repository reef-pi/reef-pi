package pwm_profile

import (
	"encoding/json"
	"fmt"
	"time"
)

type auto struct {
	Values   []float64 `json:"values"`
	min, max float64
}

func Auto(conf json.RawMessage, min, max float64) (*auto, error) {
	var a auto
	if err := json.Unmarshal(conf, &a); err != nil {
		return nil, err
	}
	if len(a.Values) != 12 {
		return nil, fmt.Errorf("exactly 12 values are expected. supllied:%d", len(a.Values))
	}
	a.min = min
	a.max = max
	return &a, nil
}

func (a *auto) Get(t time.Time) float64 {
	series := a.Values
	h1 := t.Hour() / 2
	h2 := h1 + 1
	if h2 >= 12 {
		h2 = 0
	}
	m := float64(t.Minute() + ((t.Hour() % 2) * 60))
	from := float64(series[h1])
	to := float64(series[h2])
	v := from + ((to - from) / 120.0 * m)
	switch {
	case v < a.min:
		return 0
	case v > a.max:
		return a.max
	default:
		return v
	}
}
