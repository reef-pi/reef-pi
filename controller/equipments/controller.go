package equipments

import (
	"github.com/reef-pi/reef-pi/controller/utils"
)

type Config struct {
	DevMode bool              `yaml:"dev_mode"`
	Enable  bool              `yaml:"enable"`
	Outlets map[string]Outlet `yaml:"outlets"`
}

type Store interface {
	Get(string, string, interface{}) error
	List(string, func([]byte) (interface{}, error)) (*[]interface{}, error)
	Create(string, func(string) interface{}) error
	Update(string, string, interface{}) error
	Delete(string, string) error
}

type Controller struct {
	config    Config
	telemetry *utils.Telemetry
	store     Store
}

func New(store Store, config Config, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		config:    config,
		telemetry: telemetry,
		store:     store,
	}
}

func (c *Controller) Start() {
}

func (c *Controller) Stop() {
}
