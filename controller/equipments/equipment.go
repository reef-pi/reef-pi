package equipments

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/connectors"
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
	es := []Equipment{}
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
	var outlet connectors.Outlet
	outlets, err := c.outlets.List()
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
		return fmt.Errorf("Outlet name %s not present", eq.Outlet)
	}
	if outlet.Equipment != "" {
		return fmt.Errorf("Outlet is already in use (Equipment ID: %s)", outlet.Equipment)
	}
	fn := func(id string) interface{} {
		eq.ID = id
		outlet.Equipment = id
		return &eq
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	if err := c.outlets.Update(eq.Outlet, outlet); err != nil {
		log.Println("Failed to configure outlet")
		return err
	}
	if err := c.outlets.Configure(eq.Outlet, eq.On); err != nil {
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
	return c.outlets.Configure(eq.Outlet, eq.On)
}

func (c *Controller) Delete(id string) error {
	eq, err := c.Get(id)
	if err != nil {
		return err
	}
	inUse, err := c.IsEquipmentInUse(id)
	if err != nil {
		log.Println("ERROR: equipment subsystem: failed to determine if equipment is in use")
		return err
	}
	if inUse {
		return fmt.Errorf("ERROR: equipment is in use")
	}
	outlet, err := c.outlets.Get(eq.Outlet)
	if err != nil {
		return err
	}
	outlet.Equipment = ""
	if err := c.store.Delete(Bucket, id); err != nil {
		return nil
	}
	return c.outlets.Update(outlet.ID, outlet)
}

func (c *Controller) synEquipments() {
	eqs, err := c.List()
	if err != nil {
		log.Println("ERROR: Failed to list equipments.", err)
		return
	}
	for _, eq := range eqs {
		if err := c.outlets.Configure(eq.Outlet, eq.On); err != nil {
			log.Printf("ERROR: Failed to sync equipment:%s . Error:%s\n", eq.Name, err.Error())
		}
	}
}
