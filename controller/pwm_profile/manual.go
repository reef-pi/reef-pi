package pwm_profile

import(
	"encoding/json"
	"time"
)

type manual struct {
	Value float64 `json:"value"`
}

func Manual(conf json.RawMessage) (*manual, error) {
	var m manual
	return &m, json.Unmarshal(conf, &m)
}

func (m *manual) Get(_ time.Time) float64 {
	return m.Value
}
