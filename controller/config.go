package controller

import (
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type Config struct {
	EnableGPIO  bool               `yaml:"enable_gpio"`
	EnablePWM   bool               `yaml:"enable_pwm"`
	HighRelay   bool               `yaml:"high_relay"`
	Database    string             `yaml:"database"`
	Outlets     map[string]Outlet  `yaml:"outlets"`
	Equipments  map[string]string  `yaml:"equipments"`
	Lighting    LightingConfig     `yaml:"lighting"`
	AdafruitIO  utils.AdafruitIO   `yaml:"adafruitio"`
	DevMode     bool               `yaml:"dev_mode"`
	ATO         ato.Config         `yaml:"ato"`
	Temperature temperature.Config `yaml:"temperature"`
}

type LightingConfig struct {
	Enable   bool                           `yaml:"enable"`
	Channels map[string]lighting.LEDChannel `yaml:"channels"`
}

var DefaultConfig = Config{
	Database:   "reef-pi.db",
	EnableGPIO: true,
	Outlets:    make(map[string]Outlet),
	Lighting: LightingConfig{
		Channels: make(map[string]lighting.LEDChannel),
	},
}
