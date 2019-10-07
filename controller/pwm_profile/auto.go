package pwm_profile

import (
	"encoding/json"
	"fmt"
	"time"
)

type auto struct {
	Values []float64
}

func Auto(conf json.RawMessage) (*auto, error) {
	var a auto
	if err := json.Unmarshal(conf, &a); err != nil {
		return nil, err
	}
	if len(a.Values) != 12 {
		return nil, fmt.Errorf("exactly 12 values are expected. supllied:%d", len(a.Values))
	}
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
	return from + ((to - from) / 120.0 * m)
}
