package controller

import (
	"encoding/json"
	"fmt"
	"log"
)

const EquipmentBucket = "equipments"

type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Outlet string `json:"outlet"`
	On     bool   `json:"on"`
	Value  int    `json:"value"`
}

func (c *Controller) GetEquipment(id string) (Equipment, error) {
	var eq Equipment
	return eq, c.store.Get(EquipmentBucket, id, &eq)
}

func (c Controller) ListEquipments() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var e Equipment
		return &e, json.Unmarshal(v, &e)
	}
	return c.store.List(EquipmentBucket, fn)
}

func (c *Controller) CreateEquipment(eq Equipment) error {
	fn := func(id string) interface{} {
		eq.ID = id
		return eq
	}
	if err := c.store.Create(EquipmentBucket, fn); err != nil {
		return err
	}
	outlet, ok := c.config.Outlets[eq.Outlet]
	if ok {
		if outlet.Equipment != "" {
			return fmt.Errorf("Outlet is %s already used by equipment %s", eq.Outlet, outlet.Equipment)
		}
		outlet.Equipment = eq.Name
		c.config.Outlets[eq.Outlet] = outlet
	} else {
		return fmt.Errorf("Outlet named %s not present", eq.Outlet)
	}
	return c.syncOutlet(eq)
}

func (c *Controller) syncOutlet(eq Equipment) error {
	return c.ConfigureOutlet(eq.Outlet, eq.On, eq.Value)
}

func (c *Controller) UpdateEquipment(id string, eq Equipment) error {
	if err := c.store.Update(EquipmentBucket, id, eq); err != nil {
		return err
	}
	eq.ID = id
	return c.syncOutlet(eq)
}

func (c *Controller) DeleteEquipment(id string) error {
	eq, err := c.GetEquipment(id)
	if err != nil {
		return err
	}
	outlet, ok := c.config.Outlets[eq.Outlet]
	if ok {
		log.Printf("Detaching and stopping outlet %s from equipment %s\n.", outlet.Name, eq.Name)
		c.ConfigureOutlet(outlet.Name, false, 0)
		outlet.Equipment = ""
		c.config.Outlets[outlet.Name] = outlet
	}
	return c.store.Delete(EquipmentBucket, id)
}

func (c *Controller) synEquipments() {
	eqs, err := c.ListEquipments()
	if err != nil {
		log.Println("ERROR: Failed to list equipments.", err)
		return
	}
	for _, raw := range *eqs {
		eq, ok := raw.(*Equipment)
		if !ok {
			log.Println("ERROR:Failed to convert data to equipment type.", raw)
			continue
		}
		if err := c.syncOutlet(*eq); err != nil {
			log.Printf("ERROR: Failed to sync equipment:%s . Error:%s\n", eq.Name, err.Error())
		}
	}
}
