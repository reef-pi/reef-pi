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
	ok := false
	var outlet Outlet
	outlets, err := c.ListOutlets()
	if err != nil {
		log.Println("ERROR: Failed to load outlet list. Error:", err)
		return err
	}
	for _, o := range outlets {
		if o.ID == eq.Outlet {
			ok = true
			outlet = o
			break
		}
	}
	if !ok {
		return fmt.Errorf("Outlet named %s not present", eq.Outlet)
	}
	if outlet.Equipment != "" {
		return fmt.Errorf("Outlet is %s already used by equipment %s", eq.Outlet, outlet.Equipment)
	}
	fn := func(id string) interface{} {
		eq.ID = id
		outlet.Equipment = id
		return &eq
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	if err := c.UpdateOutlet(outlet.ID, outlet); err != nil {
		log.Println("Failed to update outlet")
		return err
	}
	return c.syncOutlet(eq)
}

func (c *Controller) Update(id string, eq Equipment) error {
	eq.ID = id
	if err := c.store.Update(Bucket, id, eq); err != nil {
		return err
	}
	return c.syncOutlet(eq)
}

func (c *Controller) Delete(id string) error {
	eq, err := c.Get(id)
	if err != nil {
		return err
	}
	outlet, err := c.GetOutlet(eq.Outlet)
	if err != nil {
		return err
	}
	outlet.Equipment = ""
	if err := c.store.Delete(Bucket, id); err != nil {
		return nil
	}
	return c.UpdateOutlet(outlet.ID, outlet)
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
