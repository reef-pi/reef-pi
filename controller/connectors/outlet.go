package connectors

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/drivers"
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
		return fmt.Errorf("Outlet name can not be empty")
	}
	_, err := o.outputPin(drivers)
	return err
}

type Outlets struct {
	store   storage.Store
	drivers *drivers.Drivers
	DevMode bool
}

func NewOutlets(drivers *drivers.Drivers, store storage.Store) *Outlets {
	return &Outlets{
		store:   store,
		drivers: drivers,
	}
}

func (c *Outlets) Setup() error {
	return c.store.CreateBucket(OutletBucket)
}

func (c *Outlets) Configure(id string, on bool) error {
	o, err := c.Get(id)
	if err != nil {
		return fmt.Errorf("Outlet name: '%s' does not exist", err)
	}

	pin, err := o.outputPin(c.drivers)
	if err != nil {
		return fmt.Errorf("can't update %s - can't get output pin", id)
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
	fn := func(id string) interface{} {
		o.ID = id
		return &o
	}
	return c.store.Create(OutletBucket, fn)
}

func (c *Outlets) Update(id string, o Outlet) error {
	o.ID = id
	if err := o.IsValid(c.drivers); err != nil {
		return err
	}
	return c.store.Update(OutletBucket, id, o)
}

func (c *Outlets) List() ([]Outlet, error) {
	outlets := []Outlet{}
	fn := func(_ string, v []byte) error {
		var o Outlet
		if err := json.Unmarshal(v, &o); err != nil {
			return err
		}
		outlets = append(outlets, o)
		return nil
	}
	return outlets, c.store.List(OutletBucket, fn)
}

func (c *Outlets) Delete(id string) error {
	o, err := c.Get(id)
	if err != nil {
		return err
	}
	if o.Equipment != "" {
		return fmt.Errorf("Outlet: %s has equipment: %s attached to it.", o.Name, o.Equipment)
	}
	return c.store.Delete(OutletBucket, id)
}

func (c *Outlets) Get(id string) (Outlet, error) {
	var o Outlet
	return o, c.store.Get(OutletBucket, id, &o)
}

func (e *Outlets) LoadAPI(r *mux.Router) {

	// swagger:operation GET /api/outlets/{id} Outlet outletGet
	// Get an Outlet by id.
	// Get an existing Outlet.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the outlet
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/outlet'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/outlets/{id}", e.get).Methods("GET")

	// swagger:route GET /api/outlets Outlet outletList
	// List all Outlets.
	// List all Outlets in reef-pi.
	// responses:
	// 	200: body:[]outlet
	// 	500:
	r.HandleFunc("/api/outlets", e.list).Methods("GET")

	// swagger:operation PUT /api/outlets Outlet outletCreate
	// Create an Outlet.
	// Create a new Outlet.
	// ---
	// parameters:
	//  - in: body
	//    name: outlet
	//    description: The outlet to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/outlet'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/outlets", e.create).Methods("PUT")

	// swagger:operation DELETE /api/outlets/{id} Outlet outletDelete
	// Delete an Outlet.
	// Delete an existing Outlet.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the outlet to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/outlets/{id}", e.delete).Methods("DELETE")

	// swagger:operation POST /api/outlets/{id} Outlet outletUpdate
	// Update an Outlet.
	// Update an existing Outlet.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the outlet to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: outlet
	//   description: The outlet to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/outlet'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/outlets/{id}", e.update).Methods("POST")
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
