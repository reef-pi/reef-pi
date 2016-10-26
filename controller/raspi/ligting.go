package raspi

import (
	"fmt"
	"github.com/ranjib/reefer/controller"
)

type LightingConfig struct {
	Intensities []int `json:"intensities"`
}

type Lighting struct {
	enabled bool
	config  *LightingConfig
}

func (l *Lighting) Enable(conf interface{}) error {
	l.enabled = true
	c, ok := conf.(LightingConfig)
	if !ok {
		return fmt.Errorf("Invalid config type")
	}
	l.config = &c
	fmt.Println("MODULE", l.config)
	return nil
}

func (l *Lighting) Disable() error {
	l.enabled = false
	return nil
}

func (l *Lighting) IsEnabled() (bool, error) {
	return l.enabled, nil
}

func (l *Lighting) Config() interface{} {
	fmt.Println("RETURN", *l.config)
	return *l.config
}

func (r *Raspi) Lighting() controller.LightingAPI {
	return r.lighting
}
