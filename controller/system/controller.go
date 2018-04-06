package system

import (
	"github.com/reef-pi/reef-pi/controller/utils"
)

const Bucket = "system"

type Config struct {
	Interface string `json:"interface"`
	Name      string `json:"name"`
	Display   bool   `json:"display"`
	DevMode   bool   `json:"dev_mode"`
	Version   string `json:"version"`
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

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}
