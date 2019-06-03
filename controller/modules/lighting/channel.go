package lighting

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/pwm_profile"
	"log"
	"time"
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

func (ch Channel) GetValue(t time.Time) float64 {
	return ch.profile.Get(t)
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
