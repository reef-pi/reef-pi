package doser

import (
	"github.com/reef-pi/reef-pi/controller/equipment"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type Controller struct {
	DevMode   bool
	store     utils.Store
	telemetry *utils.Telemetry
	equipment *equipment.Controller
}

func New(devMode bool, store utils.Store, t *utils.Telemetry, eqs *equipment.Controller) (*Controller, error) {
	return &Controller{
		DevMode:   devMode,
		store:     store,
		telemetry: t,
		equipment: eqs,
	}, nil
}

func (c *Controller) Start() {}
func (c *Controller) Stop()  {}
func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}
