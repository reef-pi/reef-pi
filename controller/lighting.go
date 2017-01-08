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

func (c *Controller) GetLighting(id string) (Lighting, error) {
	var l Lighting
	return l, c.store.Get(LightingBucket, id, &l)
}

func (c Controller) ListLightings() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var l Lighting
		return &l, json.Unmarshal(v, &l)
	}
	return c.store.List(LightingBucket, fn)
}

func (c *Controller) CreateLighting(l Lighting) error {
	fn := func(id string) interface{} {
		l.ID = id
		return l
	}
	return c.store.Create(LightingBucket, fn)
}

func (c *Controller) UpdateLighting(id string, payload Lighting) error {
	return c.store.Update(LightingBucket, id, payload)
}

func (c *Controller) DeleteLighting(id string) error {
	return c.store.Delete(LightingBucket, id)
}

func (c *Controller) EnableLighting(id string) error {
	return nil
}

func (c *Controller) DisableLighting(id string) error {
	return nil
}
