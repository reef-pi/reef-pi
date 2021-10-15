package lighting

import (
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/pwm_profile"
)

//swagger:model channel
type Channel struct {
	Name        string                  `json:"name"`
	Min         float64                 `json:"min"`
	Max         float64                 `json:"max"`
	Pin         int                     `json:"pin"`
	Color       string                  `json:"color"`
	Manual      bool                    `json:"manual"`
	Value       float64                 `json:"value"`
	ProfileSpec pwm_profile.ProfileSpec `json:"profile"`
	profile     pwm_profile.Profile
}

func (ch *Channel) loadProfile() error {
	spec := ch.ProfileSpec
	spec.Min = ch.Min
	spec.Max = ch.Max
	p, err := spec.CreateProfile()
	if err != nil {
		return err
	}
	ch.profile = p
	return nil
}

func (c *Controller) UpdateChannel(jack string, ch Channel, v float64) {
	log.Println("lighting-subsystem: Setting PWM value:", v, " at channel:", ch.Pin)
	pv := make(map[int]float64)
	pv[ch.Pin] = v
	if err := c.jacks.Control(jack, pv); err != nil {
		log.Println("ERROR: lighting-subsystem: Failed to set pwm value. Error:", err)
	}
}

func (ch *Channel) ValueAt(t time.Time) (float64, error) {
	if ch.Manual {
		return ch.Value, nil
	}
	if ch.profile == nil {
		log.Println("lighting-subsystem: Loading profile for channel", ch.Name)
		if err := ch.loadProfile(); err != nil {
			return 0, err
		}
	}
	v := ch.profile.Get(t)
	if (ch.Min > 0) && (v < float64(ch.Min)) {
		return 0, nil
	}
	if (ch.Max > 0) && (v > float64(ch.Max)) {
		return ch.Max, nil
	}
	return v, nil
}
