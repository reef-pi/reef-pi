package equipments

import (
	"github.com/kidoman/embd"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

type Config struct {
	DevMode bool              `yaml:"dev_mode"`
	Enable  bool              `yaml:"enable"`
	Outlets map[string]Outlet `yaml:"outlets"`
}

type Controller struct {
	config    Config
	telemetry *utils.Telemetry
	store     utils.Store
}

func New(config Config, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		config:    config,
		telemetry: telemetry,
		store:     store,
	}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}

func (c *Controller) Start() {
	if c.config.DevMode {
		log.Println("Equipment sub-system: Running in dev mode, skipping gpio initialization")
		return
	}
	embd.InitGPIO()
}

func (c *Controller) Stop() {
	if c.config.DevMode {
		log.Println("Equipment subsystem is running in dev mode, skipping GPIO closing")
		return
	}
	embd.CloseGPIO()
}
