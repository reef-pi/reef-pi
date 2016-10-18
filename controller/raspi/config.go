package raspi

import (
	"github.com/ranjib/reefer/controller"
)

type Config struct {
	Relay1 string                 `yaml:"relay_1"`
	Relay2 string                 `yaml:"relay_2"`
	Doser1 controller.DoserConfig `yaml:"doser_1"`
	Doser2 controller.DoserConfig `yaml:"doser_2"`
}

func DefaultConfig() Config {
	var config Config
	config.Relay1 = "40"
	config.Relay2 = "38"
	config.Doser1.PWMPin = "3"
	config.Doser1.IN1Pin = "4"
	config.Doser1.IN2Pin = "5"
	config.Doser2.PWMPin = "6"
	config.Doser2.IN1Pin = "7"
	config.Doser2.IN2Pin = "8"
	return config
}
