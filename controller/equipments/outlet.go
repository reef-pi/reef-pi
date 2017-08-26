package equipments

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

const OutletBucket = "outlets"

type Outlet struct {
	ID        string `json:"id" yaml:"id"`
	Name      string `json:"name" yaml:"name"`
	Pin       int    `json:"pin" yaml:"pin"`
	Equipment string `json:"equipment" yaml:"-"`
}

func (c *Controller) syncOutlet(eq Equipment) error {
	return c.ConfigureOutlet(eq.Outlet, eq.On)
}

func (c *Controller) ConfigureOutlet(id string, on bool) error {
	o, err := c.GetOutlet(id)
	if err != nil {
		return fmt.Errorf("Outlet named: '%s' does noy exist", err)
	}
	if c.config.DevMode {
		log.Println("Dev mode on. Skipping:", id, "On:", on)
		return nil
	}
	if on {
		return utils.SwitchOn(o.Pin)
	}
	return utils.SwitchOff(o.Pin)
}

func (c *Controller) CreateOutlet(o Outlet) error {
	if o.Name == "" {
		return fmt.Errorf("Outlet name can not be empty")
	}
	if o.Pin == 0 {
		return fmt.Errorf("Set outlet pin")
	}
	fn := func(id string) interface{} {
		o.ID = id
		return &o
	}
	return c.store.Create(OutletBucket, fn)
}

func (c *Controller) UpdateOutlet(id string, o Outlet) error {
	o.ID = id
	return c.store.Update(OutletBucket, id, o)
}

func (c *Controller) ListOutlets() ([]Outlet, error) {
	outlets := []Outlet{}
	fn := func(v []byte) error {
		var o Outlet
		if err := json.Unmarshal(v, &o); err != nil {
			return err
		}
		outlets = append(outlets, o)
		return nil
	}
	return outlets, c.store.List(OutletBucket, fn)
}

func (c *Controller) DeleteOutlet(id string) error {
	o, err := c.GetOutlet(id)
	if err != nil {
		return err
	}
	if o.Equipment != "" {
		return fmt.Errorf("Outlet: %s has equipment: %s attached to it.", o.Name, o.Equipment)
	}
	return c.store.Delete(OutletBucket, id)
}

func (c *Controller) GetOutlet(id string) (Outlet, error) {
	var o Outlet
	return o, c.store.Get(OutletBucket, id, &o)
}
