package controller

import (
	"github.com/ranjib/reef-pi/controller/lighting"
)

type Config struct {
	EnableGPIO              bool              `yaml:"enable_gpio"`
	EnablePWM               bool              `yaml:"enable_pwm"`
	EnableADC               bool              `yaml:"enable_adc"`
	EnableTemperatureSensor bool              `yaml:"enable_temperature_sensor"`
	HighRelay               bool              `yaml:"high_relay"`
	Database                string            `yaml:"database"`
	TemperaturePin          int               `yaml:"temperature_pin"`
	Outlets                 map[string]Outlet `yaml:"outlets"`
	Equipments              map[string]string `yaml:"equipments"`
	Lighting                LightingConfig    `yaml:"lighting"`
	AdafruitIO              AdafruitIO        `yaml:"adafruitio"`
	DevMode                 bool              `yaml:"dev_mode"`
}

type AdafruitIO struct {
	Enabled bool   `yaml:"enabled"`
	Token   string `yaml:"token"`
	User    string `yaml:"user"`
	Feed    string `yaml:"feed"`
}

type LightingConfig struct {
	Enabled  bool                           `yaml:"enabled"`
	Channels map[string]lighting.LEDChannel `yaml:"channels"`
}

var DefaultConfig = Config{
	Database:       "reef-pi.db",
	EnableGPIO:     true,
	TemperaturePin: 0,
	Outlets:        make(map[string]Outlet),
	Lighting: LightingConfig{
		Enabled:  false,
		Channels: make(map[string]lighting.LEDChannel),
	},
}
