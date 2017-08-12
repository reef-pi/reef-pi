package timer

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"gopkg.in/robfig/cron.v2"
	"log"
)

type Config struct {
	Enable bool `yaml:"enable"`
}

type Controller struct {
	store     utils.Store
	runner    *cron.Cron
	cronIDs   map[string]cron.EntryID
	config    Config
	telemetry *utils.Telemetry
}

func New(telemetry *utils.Telemetry) *Controller {
	return &Controller{
		runner:    cron.New(),
		cronIDs:   make(map[string]cron.EntryID),
		telemetry: telemetry,
	}
}

func (c *Controller) Start() {
	if err := c.loadAllJobs(); err != nil {
		log.Println("ERROR: Failed to load timer jobs. Error:", err)
	}
}

func (c *Controller) Stop() {
	c.runner.Stop()
}
