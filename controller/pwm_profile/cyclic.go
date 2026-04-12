package pwm_profile

import (
	"encoding/json"
	"fmt"
	"math"
	"time"
)

// cyclic produces a continuous sinusoidal wave between min and max values.
// Unlike the sine profile, it is not bounded by wall-clock start/end times —
// it oscillates continuously based on elapsed Unix time, making it suitable
// for wave-maker control of DC powerheads.
type cyclic struct {
	Period     float64 `json:"period"`      // cycle duration in seconds
	PhaseShift float64 `json:"phase_shift"` // phase offset as percent of period [0, 100)
	min, max   float64
}

func (c *cyclic) Name() string {
	return _cyclicProfileName
}

// Get returns the PWM value at time t.
// value = min + (max-min) * (sin(2π*(t - phase_offset) / period) + 1) / 2
func (c *cyclic) Get(t time.Time) float64 {
	phaseOffsetSecs := (c.PhaseShift / 100.0) * c.Period
	elapsed := math.Mod(float64(t.Unix())-phaseOffsetSecs, c.Period)
	if elapsed < 0 {
		elapsed += c.Period
	}
	v := (math.Sin(2*math.Pi*elapsed/c.Period) + 1) / 2 // [0, 1]
	return c.min + v*(c.max-c.min)
}

func Cyclic(conf json.RawMessage, min, max float64) (*cyclic, error) {
	var c cyclic
	if err := json.Unmarshal(conf, &c); err != nil {
		return nil, err
	}
	if c.Period <= 0 {
		return nil, fmt.Errorf("cyclic profile: period must be greater than 0, got %.2f", c.Period)
	}
	if c.PhaseShift < 0 || c.PhaseShift >= 100 {
		return nil, fmt.Errorf("cyclic profile: phase_shift must be in [0, 100), got %.2f", c.PhaseShift)
	}
	if max <= min {
		return nil, fmt.Errorf("cyclic profile: max (%.2f) must be greater than min (%.2f)", max, min)
	}
	c.min = min
	c.max = max
	return &c, nil
}
