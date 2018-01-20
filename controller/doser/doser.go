package doser

import (
	"encoding/json"
	"log"
	"time"
)

const Bucket = "doser"

type Doser struct {
	ID        string        `json:"id"`
	Equipment string        `json:"equipment"`
	Start     time.Time     `json:"start"`
	Duration  time.Duration `json:"duration"`
}

func (c *Controller) Get(id string) (Doser, error) {
	var d Doser
	return d, c.store.Get(Bucket, id, &d)
}

func (c *Controller) Create(d Doser) error {
	fn := func(id string) interface{} {
		d.ID = id
		return &d
	}
	return c.store.Create(Bucket, fn)
}

func (c *Controller) List() ([]Doser, error) {
	dosers := []Doser{}
	fn := func(v []byte) error {
		var d Doser
		if err := json.Unmarshal(v, &d); err != nil {
			return err
		}
		dosers = append(dosers, d)
		return nil
	}
	return dosers, c.store.List(Bucket, fn)
}

func (c *Controller) Calibrate(id string, cal CalibrationDetails) error {
	d, err := c.Get(id)
	if err != nil {
		return err
	}
	log.Println(d.ID)
	return nil
}

func (c *Controller) Update(id string, d Doser) error {
	return nil
}

func (c *Controller) Schedule(id string, sc DosingSchedule) error {
	return nil
}
