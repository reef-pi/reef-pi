package equipment

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/types"
)

const Bucket = types.EquipmentBucket

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
	var outlet connectors.Outlet
	outlet, err := c.outlets.Get(eq.Outlet)

	if err != nil {
		log.Println("ERROR: Failed to load outlet list. Error:", err)
		return err
	}

	if outlet.ID == "" {
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
	if err := c.claimOutlet(outlet, eq.ID); err != nil {
		log.Println("Failed to claim outlet")
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

	oldEq, err := c.Get(id)
	if err != nil {
		return err
	}

	if oldEq.Outlet != eq.Outlet {
		outlet, err := c.outlets.Get(eq.Outlet)
		if err != nil {
			return fmt.Errorf("Outlet name %s not present", eq.Outlet)
		}
		c.releaseOutlet(oldEq.Outlet)
		c.claimOutlet(outlet, id)
	}

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
		return fmt.Errorf("equipment is in use")
	}
	c.releaseOutlet(eq.Outlet)
	return c.store.Delete(Bucket, id)
}

func (c *Controller) synEquipment() {
	eqs, err := c.List()
	if err != nil {
		log.Println("ERROR: Failed to list equipment.", err)
		return
	}
	for _, eq := range eqs {
		if err := c.outlets.Configure(eq.Outlet, eq.On); err != nil {
			log.Printf("ERROR: Failed to sync equipment:%s . Error:%s\n", eq.Name, err.Error())
		}
	}
}

func (c *Controller) releaseOutlet(outletID string) error {
	outlet, err := c.outlets.Get(outletID)
	if err != nil {
		return err
	}
	outlet.Equipment = ""
	return c.outlets.Update(outlet.ID, outlet)
}

func (c *Controller) claimOutlet(outlet connectors.Outlet, equipmentID string) error {
	outlet.Equipment = equipmentID
	return c.outlets.Update(outlet.ID, outlet)
}
