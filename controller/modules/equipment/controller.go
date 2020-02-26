package equipment

import (
	"fmt"
	"github.com/kidoman/embd"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"log"
)

type Config struct {
	DevMode bool `json:"dev_mode"`
}
type Controller struct {
	config    Config
	telemetry telemetry.Telemetry
	store     storage.Store
	outlets   *connectors.Outlets
}

func New(config Config, c controller.Controller) *Controller {
	return &Controller{
		config:    config,
		telemetry: c.Telemetry(),
		store:     c.Store(),
		outlets:   c.DM().Outlets(),
	}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}

func (c *Controller) Start() {
	if !c.config.DevMode {
		embd.InitGPIO()
	}
	eqs, err := c.List()
	if err != nil {
		log.Println("ERROR: equipment subsystem: failed to list equipment. Error:", err)
		return
	}
	for _, eq := range eqs {
		if err := c.outlets.Configure(eq.Outlet, eq.On); err != nil {
			log.Println("ERROR: equipment subsystem: Failed to sync equipment", eq.Name, ". Error:", err)
		}
	}
	log.Println("INFO: equipment subsystem: Finished syncing all equipment")
}

func (c *Controller) Stop() {
	if c.config.DevMode {
		log.Println("Equipment subsystem is running in dev mode, skipping GPIO closing")
		return
	}
}

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	switch depType {
	case storage.OutletBucket:
		eqs, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, eq := range eqs {
			if eq.Outlet == id {
				deps = append(deps, eq.Name)
			}
		}
		return deps, nil
	default:
		return deps, fmt.Errorf("unknown error type:%s", depType)
	}
}

func (c *Controller) On(id string, b bool) error {
	log.Println("Euipment:", id, "On:", b)
	e, err := c.Get(id)
	if err != nil {
		return err
	}
	e.On = b
	return c.Update(id, e)
}
