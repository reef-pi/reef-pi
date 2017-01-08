package controller

import (
	"encoding/json"
)

const LightingBucket = "lightings"

type Lighting struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Enabled     bool   `json:"enabled"`
	Outlet      string `json:"outlet"`
	Intensities []int  `json:"intensities"`
}

func (c *Controller) GetLighting(id string) (Equipment, error) {
	var eq Equipment
	return eq, c.store.Get("LightingBucket", id, &eq)
}

func (c Controller) ListLightingBucket() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var l Lighting
		if err := json.Unmarshal(v, &l); err != nil {
			return nil, err
		}
		return &l, nil
	}
	return c.store.List(LightingBucket, fn)
}

func (c *Controller) CreateLighting(eq Equipment) error {
	fn := func(id string) interface{} {
		eq.ID = id
		return eq
	}
	return c.store.Create(LightingBucket, fn)
}

func (c *Controller) UpdateLighting(id string, payload Equipment) error {
	return c.store.Update(LightingBucket, id, payload)
}

func (c *Controller) DeleteLighting(id string) error {
	return c.store.Delete(LightingBucket, id)
}
