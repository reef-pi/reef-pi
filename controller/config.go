package controller

import (
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type Config struct {
	Name        string             `yaml:"name"`
	Database    string             `yaml:"database"`
	DevMode     bool               `yaml:"dev_mode"`
	Equipments  equipments.Config  `yaml:"equipments"`
	Lighting    lighting.Config    `yaml:"lighting"`
	Temperature temperature.Config `yaml:"temperature"`
	ATO         ato.Config         `yaml:"ato"`
	Timer       timer.Config       `yaml:"timers"`
	System      system.Config      `yaml:"system"`
	AdafruitIO  utils.AdafruitIO   `yaml:"adafruitio"`
}

var DefaultConfig = Config{
	Database: "reef-pi.db",
	Equipments: equipments.Config{
		Outlets: make(map[string]equipments.Outlet),
	},
	Lighting: lighting.DefaultConfig,
}
