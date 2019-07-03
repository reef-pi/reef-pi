package pwm_profile

import (
	"encoding/json"
	"fmt"
	"time"
)

// a temporal profile has time bounds (start and end time, and the value at any given time is calculated considering those
type temporal struct {
	start    time.Time
	end      time.Time
	min, max float64
}

func Temporal(conf json.RawMessage, min, max float64) (temporal, error) {
	var t temporal
	tFormat := "15:04"
	config := struct {
		Start string `json:"start"`
		End   string `json:"end"`
	}{}
	if err := json.Unmarshal(conf, &config); err != nil {
		return t, err
	}
	s, err := time.Parse(tFormat, config.Start)
	if err != nil {
		return t, fmt.Errorf("Failed to parse start time. Error:%s", err)
	}
	if max == 0 {
		max = 100
	}
	e, err := time.Parse(tFormat, config.End)
	if err != nil {
		return t, fmt.Errorf("Failed to parse end time. Error:%s", err)
	}
	if min < 0 {
		return t, fmt.Errorf("minimum should be 0 or above, supplied:%f", min)
	}
	if max > 100 || max <= min {
		return t, fmt.Errorf("minimum should be equal or less than 100 and above supplied:%f", max)
	}
	return temporal{
		min:   min,
		max:   max,
		start: s,
		end:   e,
	}, nil
}
