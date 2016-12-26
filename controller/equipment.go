package controller

import (
	"encoding/json"
)

type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Outlet string `json:"outlet"`
}

func (c *Controller) GetEquipment(id string) (Equipment, error) {
	var eq Equipment
	return eq, c.store.Get("equipments", id, &eq)
}

func (c Controller) ListEquipments() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var e Equipment
		if err := json.Unmarshal(v, &e); err != nil {
			return nil, err
		}
		return map[string]string{
			"id":   e.ID,
			"name": e.Name,
		}, nil
	}
	return c.store.List("equipments", fn)
}

func (c *Controller) CreateEquipment(eq Equipment) error {
	fn := func(id string) interface{} {
		eq.ID = id
		return eq
	}
	return c.store.Create("equipments", fn)
}

func (c *Controller) UpdateEquipment(id string, payload Equipment) error {
	return c.store.Update("equipments", id, payload)
}

func (c *Controller) DeleteEquipment(id string) error {
	return c.store.Delete("equipments", id)
}
