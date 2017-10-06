package doser

import (
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type Controller struct {
	DevMode    bool
	store      utils.Store
	telemetry  *utils.Telemetry
	equipments *equipments.Controller
}

func New(devMode bool, store utils.Store, t *utils.Telemetry, eqs *equipments.Controller) (*Controller, error) {
	return &Controller{
		DevMode:    devMode,
		store:      store,
		telemetry:  t,
		equipments: eqs,
	}, nil
}

func (c *Controller) Start() {}
func (c *Controller) Stop()  {}
func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}
