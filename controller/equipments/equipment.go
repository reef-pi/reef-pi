package equipments

import (
	"encoding/json"
	"fmt"
	"log"
)

const Bucket = "equipments"

type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Outlet string `json:"outlet"`
	On     bool   `json:"on"`
}

func (c *Controller) Get(id string) (Equipment, error) {
	var eq Equipment
	return eq, c.store.Get(Bucket, id, &eq)
}

func (c Controller) List() ([]Equipment, error) {
	var es []Equipment
	fn := func(v []byte) error {
		var eq Equipment
		if err := json.Unmarshal(v, &eq); err != nil {
			return err
		}
		es = append(es, eq)
		return nil
	}
	return es, c.store.List(Bucket, fn)
}

func (c *Controller) Create(eq Equipment) error {
	outlet, ok := c.config.Outlets[eq.Outlet]
	if !ok {
		return fmt.Errorf("Outlet named %s not present", eq.Outlet)
	}
	if outlet.Equipment != "" {
		return fmt.Errorf("Outlet is %s already used by equipment %s", eq.Outlet, outlet.Equipment)
	}
	outlet.Equipment = eq.Name
	c.config.Outlets[eq.Outlet] = outlet

	fn := func(id string) interface{} {
		eq.ID = id
		return &eq
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	return c.syncOutlet(eq)
}

func (c *Controller) syncOutlet(eq Equipment) error {
	return c.ConfigureOutlet(eq.Outlet, eq.On)
}

func (c *Controller) Update(id string, eq Equipment) error {
	if err := c.store.Update(Bucket, id, eq); err != nil {
		return err
	}
	eq.ID = id
	return c.syncOutlet(eq)
}

func (c *Controller) Delete(id string) error {
	eq, err := c.Get(id)
	if err != nil {
		return err
	}
	outlet, ok := c.config.Outlets[eq.Outlet]
	if ok {
		log.Printf("Detaching and stopping outlet %s from equipment %s\n.", outlet.Name, eq.Name)
		c.ConfigureOutlet(outlet.Name, false)
		outlet.Equipment = ""
		c.config.Outlets[outlet.Name] = outlet
	}
	return c.store.Delete(Bucket, id)
}

func (c *Controller) synEquipments() {
	eqs, err := c.List()
	if err != nil {
		log.Println("ERROR: Failed to list equipments.", err)
		return
	}
	for _, eq := range eqs {
		if err := c.syncOutlet(eq); err != nil {
			log.Printf("ERROR: Failed to sync equipment:%s . Error:%s\n", eq.Name, err.Error())
		}
	}
}
