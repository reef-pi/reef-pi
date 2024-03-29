package connectors

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"

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
	store   storage.Store
	drivers *drivers.Drivers
}

func (e *Inlets) LoadAPI(r *mux.Router) {

	// swagger:operation GET /api/inlets/{id} Inlet inletGet
	// Get an Inlet by id.
	// Get an existing Inlet.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the inlet
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/inlet'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/inlets/{id}", e.get).Methods("GET")

	// swagger:route GET /api/inlets Inlet inletList
	// List all Inlets.
	// List all inlets in reef-pi.
	// responses:
	// 	200: body:[]inlet
	r.HandleFunc("/api/inlets", e.list).Methods("GET")

	// swagger:operation PUT /api/inlets Inlet inletCreate
	// Create an Inlet.
	// Create a new Inlet.
	// ---
	// parameters:
	//  - in: body
	//    name: inlet
	//    description: The inlet to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/inlet'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/inlets", e.create).Methods("PUT")

	// swagger:operation DELETE /api/inlets/{id} Inlet inletDelete
	// Delete an Inlet.
	// Delete an existing Inlet.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the inlet to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/inlets/{id}", e.delete).Methods("DELETE")

	//swagger:operation POST /api/inlets/{id} Inlet inletUpdate
	//Update an Inlet.
	//Update an existing Inlet.
	//
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the inlet to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: inlet
	//   description: The inlet to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/inlet'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/inlets/{id}", e.update).Methods("POST")

	// swagger:operation POST /api/inlets/{id}/read Inlet inletRead
	// Read an Inlet.
	// Read an Inlet.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the inlet to read
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/inlets/{id}/read", e.read).Methods("POST")
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
		return errors.New("Inlet name can not be empty")
	}
	if _, err := i.inputPin(drivers); err != nil {
		return fmt.Errorf("inlet %s did not get associated with a driver pin: %v", i.Name, err)
	}
	return nil
}

func NewInlets(drivers *drivers.Drivers, store storage.Store) *Inlets {
	return &Inlets{
		store:   store,
		drivers: drivers,
	}
}

func (c *Inlets) Setup() error {
	return c.store.CreateBucket(InletBucket)
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
	fn := func(id string) interface{} {
		i.ID = id
		return &i
	}
	return c.store.Create(InletBucket, fn)
}

func (c *Inlets) Update(id string, i Inlet) error {
	i.ID = id
	if err := i.IsValid(c.drivers); err != nil {
		return err
	}
	return c.store.Update(InletBucket, id, i)
}

func (c *Inlets) List() ([]Inlet, error) {
	inlets := []Inlet{}
	fn := func(_ string, v []byte) error {
		var i Inlet
		if err := json.Unmarshal(v, &i); err != nil {
			return err
		}
		inlets = append(inlets, i)
		return nil
	}
	return inlets, c.store.List(InletBucket, fn)
}

func (c *Inlets) Delete(id string) error {
	i, err := c.Get(id)
	if err != nil {
		return err
	}
	if i.Equipment != "" {
		return fmt.Errorf("Inlet: %s has equipment: %s attached to it.", i.Name, i.Equipment)
	}
	return c.store.Delete(InletBucket, id)
}

func (c *Inlets) Get(id string) (Inlet, error) {
	var i Inlet
	return i, c.store.Get(InletBucket, id, &i)
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
