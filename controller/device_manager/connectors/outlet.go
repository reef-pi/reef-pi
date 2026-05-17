package connectors

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const OutletBucket = storage.OutletBucket

// swagger:model outlet
type Outlet struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Pin       int    `json:"pin"`
	Equipment string `json:"equipment"`
	Reverse   bool   `json:"reverse"`
	Driver    string `json:"driver"`
}

func (c *Outlets) HalPin(id string) (hal.DigitalOutputPin, error) {
	o, err := c.Get(id)
	if err != nil {
		return nil, fmt.Errorf("Outlet name: '%s' does not exist", err)
	}

	return o.outputPin(c.drivers)
}

func (o Outlet) outputPin(drivers *drivers.Drivers) (hal.DigitalOutputPin, error) {
	d, err := drivers.DigitalOutputDriver(o.Driver)
	if err != nil {
		return nil, fmt.Errorf("outlet %s driver lookup failure: %v", o.Name, err)
	}
	pin, err := d.DigitalOutputPin(o.Pin)
	if err != nil {
		return nil, fmt.Errorf("no valid input pin %d: %v", o.Pin, err)
	}
	return pin, nil
}

func (o Outlet) IsValid(drivers *drivers.Drivers) error {
	if o.Name == "" {
		return fmt.Errorf("Outlet name cannot be empty")
	}
	_, err := o.outputPin(drivers)
	return err
}

type Outlets struct {
	repo    outletRepository
	drivers *drivers.Drivers
}

func NewOutlets(drivers *drivers.Drivers, store storage.Store) *Outlets {
	return &Outlets{
		repo:    newOutletRepository(store),
		drivers: drivers,
	}
}

func (c *Outlets) Setup() error {
	return c.repo.Setup()
}

func (c *Outlets) Configure(id string, on bool) error {
	o, err := c.Get(id)
	if err != nil {
		return fmt.Errorf("Outlet name: '%s' does not exist", err)
	}
	pin, err := o.outputPin(c.drivers)
	if err != nil {
		return fmt.Errorf("can't update %s - can't get output pin", err)
	}

	if o.Reverse {
		on = !on
	}
	return pin.Write(on)
}

func (c *Outlets) Create(o Outlet) error {
	if err := o.IsValid(c.drivers); err != nil {
		return err
	}
	return c.repo.Create(o)
}

func (c *Outlets) Update(id string, o Outlet) error {
	o.ID = id
	if err := o.IsValid(c.drivers); err != nil {
		return err
	}
	return c.repo.Update(id, o)
}

func (c *Outlets) List() ([]Outlet, error) {
	return c.repo.List()
}

func (c *Outlets) Delete(id string) error {
	o, err := c.Get(id)
	if err != nil {
		return err
	}
	if o.Equipment != "" {
		return fmt.Errorf("Outlet: %s has equipment: %s attached to it.", o.Name, o.Equipment)
	}
	return c.repo.Delete(id)
}

func (c *Outlets) Get(id string) (Outlet, error) {
	return c.repo.Get(id)
}

func (e *Outlets) LoadAPI(r chi.Router) {
	r.Get("/api/outlets/{id}", e.get)
	r.Get("/api/outlets", e.list)
	r.Put("/api/outlets", e.create)
	r.Delete("/api/outlets/{id}", e.delete)
	r.Post("/api/outlets/{id}", e.update)
}
func (c *Outlets) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Outlets) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Outlets) update(w http.ResponseWriter, r *http.Request) {
	var o Outlet
	fn := func(id string) error {
		return c.Update(id, o)
	}
	utils.JSONUpdateResponse(&o, fn, w, r)
}

func (c *Outlets) create(w http.ResponseWriter, r *http.Request) {
	var o Outlet
	fn := func() error {
		return c.Create(o)
	}
	utils.JSONCreateResponse(&o, fn, w, r)
}

func (c *Outlets) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
