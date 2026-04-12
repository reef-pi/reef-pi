package pwm_profile

import (
	"encoding/json"
	"fmt"
	"math"
	"time"
)

// circadian models a natural daylight cycle suitable for reef aquariums.
// Unlike the sine profile (which requires min < max), circadian allows
// dawn_value > noon_value so that warm-spectrum channels (red, orange) can be
// high at dawn/dusk and low at solar noon, while cool-spectrum channels
// (blue, white) do the opposite.
//
// The value follows a half-sine curve:
//
//	v(t) = dawn_value + (noon_value - dawn_value) * sin(π * elapsed / total)
//
// which smoothly transitions from dawn_value at the edges to noon_value at midday.
type circadian struct {
	temporal
	DawnValue float64 `json:"dawn_value"` // value at start and end of the window [0,100]
	NoonValue float64 `json:"noon_value"` // value at solar noon (midpoint) [0,100]
}

func (c *circadian) Name() string {
	return _circadianProfileName
}

func (c *circadian) Get(t time.Time) float64 {
	if c.IsOutside(t) {
		return 0
	}
	elapsed := c.PastSeconds(t)
	total := c.TotalSeconds()
	// half-sine: 0 at edges, 1 at midpoint
	frac := math.Sin(math.Pi * elapsed / total)
	return c.DawnValue + frac*(c.NoonValue-c.DawnValue)
}

func Circadian(conf json.RawMessage, min, max float64) (*circadian, error) {
	var c circadian
	if err := json.Unmarshal(conf, &c); err != nil {
		return nil, err
	}
	if c.DawnValue < 0 || c.DawnValue > 100 {
		return nil, fmt.Errorf("circadian profile: dawn_value must be in [0, 100], got %.2f", c.DawnValue)
	}
	if c.NoonValue < 0 || c.NoonValue > 100 {
		return nil, fmt.Errorf("circadian profile: noon_value must be in [0, 100], got %.2f", c.NoonValue)
	}
	if c.DawnValue == c.NoonValue {
		return nil, fmt.Errorf("circadian profile: dawn_value and noon_value must differ")
	}
	// temporal.Build validates start/end and sets min/max from the profile spec;
	// pass 0/100 so it doesn't reject values from a wide range.
	t, err := Temporal(conf, 0, 100)
	if err != nil {
		return nil, err
	}
	c.temporal = t
	return &c, nil
}
