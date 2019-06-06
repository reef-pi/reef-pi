package lighting

import (
	"log"
	"time"

	"github.com/reef-pi/reef-pi/pwm_profile"
)

type Channel struct {
	Name     string  `json:"name"`
	Min      float64 `json:"min"`
	StartMin int     `json:"start_min"`
	Max      float64 `json:"max"`
	Reverse  bool    `json:"reverse"`
	Pin      int     `json:"pin"`
	Color    string  `json:"color"`
	Profile  string  `json:"profile"`
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

func (c *Controller) ProfileValue(ch Channel, t time.Time) (float64, error) {
	var v float64
	if ch.Profile == "" {
		return float64(ch.Min), nil
	}
	if ch.profile == nil {
		spec, err := c.pManager.Get(ch.Profile)
		if err != nil {
			return 0, err
		}
		spec.Min = ch.Min
		spec.Max = ch.Max
		p, err := spec.CreateProfile()
		if err != nil {
			return 0, err
		}
		ch.profile = p
	}
	v = ch.profile.Get(t)
	if (ch.Min > 0) && (v < float64(ch.Min)) {
		return float64(ch.StartMin), nil
	}
	if (ch.Max > 0) && (v > float64(ch.Max)) {
		return float64(ch.Max), nil
	}
	return v, nil
}
