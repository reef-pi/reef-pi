package equipment

import (
	"fmt"
	"log"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Controller struct {
	telemetry telemetry.Telemetry
	store     storage.Store
	outlets   *connectors.Outlets
}

func New(c controller.Controller) *Controller {
	return &Controller{
		telemetry: c.Telemetry(),
		store:     c.Store(),
		outlets:   c.DM().Outlets(),
	}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}

func (c *Controller) Start() {
	eqs, err := c.List()
	if err != nil {
		log.Println("ERROR: equipment subsystem: failed to list equipment. Error:", err)
		return
	}
	for _, eq := range eqs {
		if eq.StayOffOnBoot {
			eq.On = false
			if err := c.Update(eq.ID, eq); err != nil {
				log.Println("ERROR: equipment subsystem: Failed to turn off ", eq.Name, " which is set up to stay off upon boot. Error:", err)
			}
		}
		if err := c.updateOutlet(eq); err != nil {
			log.Println("ERROR: equipment subsystem: Failed to sync equipment", eq.Name, ". Error:", err)
		}
	}
	log.Println("INFO: equipment subsystem: Finished syncing all equipment")
}

func (c *Controller) Stop() {
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
func (c *Controller) updateOutlet(eq Equipment) error {
	if err := c.outlets.Configure(eq.Outlet, eq.On); err != nil {
		return err
	}
	m := 0.0
	if eq.On {
		m = 1.0
	}
	c.telemetry.EmitMetric("equipment", eq.Name+"-state", m)
	return nil
}
