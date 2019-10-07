package pwm_profile

import (
	"encoding/json"
	"time"
)

type composite struct {
	profiles []Profile
}

func Composite(conf json.RawMessage) (*composite, error) {
	var config []ProfileSpec
	if err := json.Unmarshal(conf, &config); err != nil {
		return nil, err
	}
	var profiles []Profile
	for _, c := range config {
		p, err := c.CreateProfile()
		if err != nil {
			return nil, err
		}
		profiles = append(profiles, p)
	}
	return &composite{
		profiles: profiles,
	}, nil
}

func (c *composite) Get(t time.Time) float64 {
	return 0
}
