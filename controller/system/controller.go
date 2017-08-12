package system

import (
	"github.com/reef-pi/reef-pi/controller/utils"
)

type Config struct {
	Enable    bool   `yaml:"enable" json:"enable"`
	Interface string `yaml:"interface" json:"interface"`
	Name      string `yaml:"name" json:"name"`
	Display   bool   `yaml:"display" json:"display"`
	DevMode   bool   `yaml:"dev_mode"`
}

type Controller struct {
	config    Config
	store     utils.Store
	telemetry *utils.Telemetry
}

func New(conf Config, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		config:    conf,
		store:     store,
		telemetry: telemetry,
	}
}

func (c *Controller) Start() {
	c.logStartTime()
}

func (c *Controller) Stop() {
	c.logStopTime()
}
