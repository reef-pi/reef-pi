package controller

import (
	"fmt"
	"time"
)

type ATO struct {
	enabled bool
	config  ATOConfig
}

type ATOConfig struct {
	LowHeight     uint          `json:"low_height"`
	HighHeight    uint          `json:"high_height"`
	CheckInterval time.Duration `json:"check_interval"`
}

func (a *ATO) Name() string {
	return "Automatic Top Off"
}

func (a *ATO) Enable() error {
	a.enabled = true
	return nil
}

func (a *ATO) Disable() error {
	a.enabled = false
	return nil
}

func (a *ATO) IsEnabled() bool {
	return a.enabled
}

func (a *ATO) Configure(c interface{}) error {
	config, ok := c.(ATOConfig)
	if !ok {
		fmt.Errorf("%#v is not a valid ATO configuration", c)
	}
	a.config = config
	return a.reconfigure()
}

func (a *ATO) reconfigure() error {
	return nil
}
