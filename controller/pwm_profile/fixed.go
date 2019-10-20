package pwm_profile

import (
	"encoding/json"
	"time"
)

type fixed struct {
	temporal
	Value float64 `json:"value"`
}

func Fixed(conf json.RawMessage, min, max float64) (*fixed, error) {
	var m fixed
	if err := json.Unmarshal(conf, &m); err != nil {
		return nil, err
	}
	if err := m.Build(min, max); err != nil {
		return nil, err
	}
	return &m, nil
}

func (m *fixed) Get(t time.Time) float64 {
	if m.IsOutside(t) {
		return 0
	}
	return m.Value
}
