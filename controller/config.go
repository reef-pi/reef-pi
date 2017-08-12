package controller

import (
	"github.com/reef-pi/reef-pi/auth"
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

type Config struct {
	Name     string `yaml:"name"`
	Database string `yaml:"database"`
	DevMode  bool   `yaml:"dev_mode"`

	Equipments  equipments.Config  `yaml:"equipments"`
	Lighting    lighting.Config    `yaml:"lighting"`
	Temperature temperature.Config `yaml:"temperature"`
	ATO         ato.Config         `yaml:"ato"`
	Timer       timer.Config       `yaml:"timers"`
	System      system.Config      `yaml:"system"`

	AdafruitIO utils.AdafruitIO `yaml:"adafruitio"`
	API        API              `yaml:"api"`
}

var DefaultConfig = Config{
	Database: "reef-pi.db",
	Equipments: equipments.Config{
		Outlets: make(map[string]equipments.Outlet),
	},
	Lighting: lighting.DefaultConfig,
}

type API struct {
	EnableAuth     bool        `yaml:"enable_auth"`
	Address        string      `yaml:"address"`
	Auth           auth.Config `yaml:"auth"`
	ImageDirectory string      `yaml:"image_directory"`
}

func ParseConfig(filename string) (Config, error) {
	var c Config
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return c, err
	}
	if err := yaml.Unmarshal(content, &c); err != nil {
		return c, err
	}
	for k, o := range c.Equipments.Outlets {
		o.Name = k
		if o.Type == "" {
			o.Type = "switch"
		}
		c.Equipments.Outlets[o.Name] = o
	}
	return c, nil
}
