package lighting

import (
	"encoding/json"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/pwm_profile"
)

type Profile struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

type Channel struct {
	Name     string  `json:"name"`
	Min      int     `json:"min"`
	StartMin int     `json:"start_min"`
	Max      int     `json:"max"`
	Reverse  bool    `json:"reverse"`
	Pin      int     `json:"pin"`
	Color    string  `json:"color"`
	Profile  Profile `json:"profile"`
	profile  pwm_profile.Profile
}

func (c *Controller) UpdateChannel(jack string, ch Channel, v float64) {
	if ch.Reverse {
		v = 100 - v
	}
	log.Println("lighting-subsystem: Setting PWM value:", v, " at channel:", ch.Pin)
	pv := make(map[int]float64)
	pv[ch.Pin] = v
	if err := c.jacks.Control(jack, pv); err != nil {
		log.Println("ERROR: lighting-subsystem: Failed to set pwm value. Error:", err)
	}
}

func (ch *Channel) ProfileValue(t time.Time) (float64, error) {
	if ch.profile == nil {
		spec := pwm_profile.ProfileSpec{
			Name:   ch.Name,
			Type:   ch.Profile.Type,
			Config: ch.Profile.Config,
		}
		p, err := spec.CreateProfile()
		if err != nil {
			return 0, err
		}
		ch.profile = p
	}
	v := ch.profile.Get(t)
	if (ch.Min > 0) && (v < float64(ch.Min)) {
		return float64(ch.StartMin), nil
	}
	if (ch.Max > 0) && (v > float64(ch.Max)) {
		return float64(ch.Max), nil
	}
	return v, nil
}
