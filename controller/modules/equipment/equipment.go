package equipment

import (
	"encoding/json"
	"log"

	"github.com/reef-pi/reef-pi/controller/storage"
)

const Bucket = storage.EquipmentBucket

//swagger:model equipment
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
	es := []Equipment{}
	fn := func(_ string, v []byte) error {
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
	fn := func(id string) interface{} {
		eq.ID = id
		return &eq
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	if err := c.updateOutlet(eq); err != nil {
		log.Println("Failed to configure outlet")
		return err
	}
	return nil
}

func (c *Controller) Update(id string, eq Equipment) error {
	eq.ID = id
	if err := c.store.Update(Bucket, id, eq); err != nil {
		return err
	}
	return c.updateOutlet(eq)
}

func (c *Controller) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	return c.store.Delete(Bucket, id)
}

func (c *Controller) synEquipment() {
	eqs, err := c.List()
	if err != nil {
		log.Println("ERROR: Failed to list equipment.", err)
		return
	}
	for _, eq := range eqs {
		if err := c.updateOutlet(eq); err != nil {
			log.Printf("ERROR: Failed to sync equipment:%s . Error:%s\n", eq.Name, err.Error())
		}
	}
}
