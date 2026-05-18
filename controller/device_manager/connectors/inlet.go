package connectors

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const InletBucket = storage.InletBucket

// swagger:model inlet
type Inlet struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Pin       int    `json:"pin"`
	Equipment string `json:"equipment"`
	Reverse   bool   `json:"reverse"`
	Driver    string `json:"driver"`
}

type Inlets struct {
	repo    inletRepository
	drivers *drivers.Drivers
}

func (e *Inlets) LoadAPI(r chi.Router) {
	r.Get("/api/inlets/{id}", e.get)
	r.Get("/api/inlets", e.list)
	r.Put("/api/inlets", e.create)
	r.Delete("/api/inlets/{id}", e.delete)
	r.Post("/api/inlets/{id}", e.update)
	r.Post("/api/inlets/{id}/read", e.read)
}

func (i Inlet) inputPin(drivers *drivers.Drivers) (hal.DigitalInputPin, error) {
	d, err := drivers.DigitalInputDriver(i.Driver)
	if err != nil {
		return nil, fmt.Errorf("inlet %s driver lookup failure: %v", i.Name, err)
	}
	inputPin, err := d.DigitalInputPin(i.Pin)
	if err != nil {
		return nil, fmt.Errorf("no valid input pin %d: %v", i.Pin, err)
	}
	return inputPin, nil
}

func (i Inlet) IsValid(drivers *drivers.Drivers) error {
	if i.Name == "" {
		return errors.New("Inlet name cannot be empty")
	}
	if _, err := i.inputPin(drivers); err != nil {
		return fmt.Errorf("inlet %s did not get associated with a driver pin: %v", i.Name, err)
	}
	return nil
}

func NewInlets(drivers *drivers.Drivers, store storage.Store) *Inlets {
	return &Inlets{
		repo:    newInletRepository(store),
		drivers: drivers,
	}
}

func (c *Inlets) Setup() error {
	return c.repo.Setup()
}

func (c *Inlets) Read(id string) (int, error) {
	i, err := c.Get(id)
	if err != nil {
		return -1, fmt.Errorf("Inlet name: '%s' does not exist", err)
	}

	inputPin, err := i.inputPin(c.drivers)
	if err != nil {
		return 0, fmt.Errorf("can't perform read: %v", err)
	}
	v, err := inputPin.Read()

	if i.Reverse {
		v = !v
	}
	if v {
		return 1, err
	}
	return 0, err
}

func (c *Inlets) Create(i Inlet) error {
	if err := i.IsValid(c.drivers); err != nil {
		return err
	}
	return c.repo.Create(i)
}

func (c *Inlets) Update(id string, i Inlet) error {
	i.ID = id
	if err := i.IsValid(c.drivers); err != nil {
		return err
	}
	return c.repo.Update(id, i)
}

func (c *Inlets) List() ([]Inlet, error) {
	return c.repo.List()
}

func (c *Inlets) Delete(id string) error {
	i, err := c.Get(id)
	if err != nil {
		return err
	}
	if i.Equipment != "" {
		return fmt.Errorf("Inlet: %s has equipment: %s attached to it.", i.Name, i.Equipment)
	}
	return c.repo.Delete(id)
}

func (c *Inlets) Get(id string) (Inlet, error) {
	return c.repo.Get(id)
}

func (c *Inlets) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Inlets) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Inlets) update(w http.ResponseWriter, r *http.Request) {
	var i Inlet
	fn := func(id string) error {
		return c.Update(id, i)
	}
	utils.JSONUpdateResponse(&i, fn, w, r)
}
func (c *Inlets) read(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Read(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Inlets) create(w http.ResponseWriter, r *http.Request) {
	var i Inlet
	fn := func() error {
		return c.Create(i)
	}
	utils.JSONCreateResponse(&i, fn, w, r)
}

func (c *Inlets) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
