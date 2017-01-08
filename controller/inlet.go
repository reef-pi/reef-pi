package controller

import (
	"encoding/json"
	"github.com/kidoman/embd"
	_ "github.com/kidoman/embd/host/rpi"
)

const (
	INLET_BUCKET = "inlets"
)

type Inlet struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Pin  int    `json:"pin"`
	Type string `json:"type"`
}

func (c *Controller) ReadFromInlet(i *Inlet) (int, error) {
	switch i.Type {
	case "digital":
		p, err := embd.NewDigitalPin(i.Pin)
		if err != nil {
			return 0, err
		}
		if err := p.SetDirection(embd.In); err != nil {
			return 0, err
		}
		return p.Read()
	case "analog":
		return c.adc.Read(i.Pin)
	}
	return 0, nil
}

func (c *Controller) GetInlet(id string) (Inlet, error) {
	var inlet Inlet
	return inlet, c.store.Get(INLET_BUCKET, id, &inlet)
}

func (c *Controller) ListInlets() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var inlet Inlet
		if err := json.Unmarshal(v, &inlet); err != nil {
			return nil, err
		}
		return inlet, nil
	}
	return c.store.List(INLET_BUCKET, fn)
}

func (c *Controller) CreateInlet(inlet Inlet) error {
	fn := func(id string) interface{} {
		inlet.ID = id
		return inlet
	}
	return c.store.Create(INLET_BUCKET, fn)
}

func (c *Controller) UpdateInlet(id string, payload interface{}) error {
	return c.store.Update(INLET_BUCKET, id, payload)
}

func (c *Controller) DeleteInlet(id string) error {
	return c.store.Delete(INLET_BUCKET, id)
}
