package equipment

import (
	"fmt"
	"log"

	"github.com/reef-pi/reef-pi/controller/storage"
)

const Bucket = storage.EquipmentBucket

//swagger:model equipment
type Equipment struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Outlet        string `json:"outlet"`
	On            bool   `json:"on"`
	StayOffOnBoot bool   `json:"stay_off_on_boot"`
	BootDelay     int    `json:"boot_delay"` // seconds to wait after powering on during boot
}

func (c *Controller) Get(id string) (Equipment, error) {
	return c.repo.Get(id)
}

func (c Controller) List() ([]Equipment, error) {
	return c.repo.List()
}

func (c *Controller) validateOutlet(eq Equipment) error {
	existing, err := c.List()
	if err != nil {
		return err
	}
	for _, e := range existing {
		if e.ID != eq.ID && e.Outlet == eq.Outlet {
			return fmt.Errorf("outlet '%s' is already in use by equipment '%s'", eq.Outlet, e.Name)
		}
	}
	return nil
}

func (c *Controller) Create(eq Equipment) error {
	if err := c.validateOutlet(eq); err != nil {
		return err
	}
	created, err := c.repo.Create(eq)
	if err != nil {
		return err
	}
	if err := c.updateOutlet(created); err != nil {
		log.Println("Failed to configure outlet")
		return err
	}
	return nil
}

func (c *Controller) Update(id string, eq Equipment) error {
	eq.ID = id
	if err := c.validateOutlet(eq); err != nil {
		return err
	}
	if err := c.repo.Update(id, eq); err != nil {
		return err
	}
	return c.updateOutlet(eq)
}

func (c *Controller) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	return c.repo.Delete(id)
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
