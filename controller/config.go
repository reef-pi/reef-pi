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
	Database    string             `yaml:"database"`
	Equipments  equipments.Config  `yaml:"equipments"`
	Lighting    lighting.Config    `yaml:"lighting"`
	AdafruitIO  utils.AdafruitIO   `yaml:"adafruitio"`
	DevMode     bool               `yaml:"dev_mode"`
	ATO         ato.Config         `yaml:"ato"`
	Temperature temperature.Config `yaml:"temperature"`
	Name        string             `yaml:"name"`
	Dashboard   DashboardConfig    `yaml:"dashboard"`
	Timers      timer.Config       `yaml:"timers"`
	System      system.Config      `yaml:"system"`
}

type DashboardConfig struct {
	Enable bool `yaml:"enable"`
}
type TimersConfig struct {
	Enable bool `yaml:"enable"`
}

var DefaultConfig = Config{
	Database: "reef-pi.db",
	Equipments: equipments.Config{
		Outlets: make(map[string]equipments.Outlet),
	},
}
