package connectors

import (
	"encoding/json"
	"fmt"

	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const AnalogInputBucket = storage.AnalogInputBucket

// swagger:model analogInput
type AnalogInput struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Pin    int    `json:"pin"`
	Driver string `json:"driver"` // can be either hal or pca9685
}

type AnalogInputs struct {
	store   storage.Store
	drivers *drivers.Drivers
}

func (j AnalogInput) channel(drvrs *drivers.Drivers) (hal.AnalogInputPin, error) {
	d, err := drvrs.AnalogInputDriver(j.Driver)
	if err != nil {
		return nil, fmt.Errorf("driver %s for analog input %s not found: %v", j.Driver, j.Name, err)
	}
	return d.AnalogInputPin(j.Pin)
}

func (j AnalogInput) IsValid(drvrs *drivers.Drivers) error {
	if j.Name == "" {
		return fmt.Errorf("AnalogInput name can not be empty")
	}
	_, err := j.channel(drvrs)
	if err != nil {
		return fmt.Errorf("invalid pin %d: %v", j.Pin, err)
	}
	return nil
}

func NewAnalogInputs(drivers *drivers.Drivers, store storage.Store) *AnalogInputs {
	return &AnalogInputs{
		store:   store,
		drivers: drivers,
	}
}

func (c *AnalogInputs) Setup() error {
	if err := c.store.CreateBucket(AnalogInputBucket); err != nil {
		return err
	}

	return nil
}

func (c *AnalogInputs) Get(id string) (AnalogInput, error) {
	var j AnalogInput
	return j, c.store.Get(AnalogInputBucket, id, &j)
}

func (c *AnalogInputs) List() ([]AnalogInput, error) {
	ais := []AnalogInput{}
	fn := func(_ string, v []byte) error {
		var j AnalogInput
		if err := json.Unmarshal(v, &j); err != nil {
			return err
		}
		ais = append(ais, j)
		return nil
	}
	return ais, c.store.List(AnalogInputBucket, fn)
}

func (c *AnalogInputs) Create(j AnalogInput) error {
	if err := j.IsValid(c.drivers); err != nil {
		return err
	}

	fn := func(id string) interface{} {
		j.ID = id
		return &j
	}
	if err := c.store.Create(AnalogInputBucket, fn); err != nil {
		return err
	}
	return nil
}

func (c *AnalogInputs) Update(id string, j AnalogInput) error {
	if err := j.IsValid(c.drivers); err != nil {
		return err
	}
	j.ID = id
	if err := c.store.Update(AnalogInputBucket, id, j); err != nil {
		return err
	}
	return nil
}

func (c *AnalogInputs) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	return c.store.Delete(AnalogInputBucket, id)
}

func (c *AnalogInputs) LoadAPI(r *mux.Router) {

	// swagger:route GET /api/analog_inputs AnalogInput analogInputList
	// List all Analog Inputs.
	// List all Analog Inputs in reef-pi.
	// responses:
	// 	200: body:[]analogInput
	// 	500:
	r.HandleFunc("/api/analog_inputs", c.list).Methods("GET")

	// swagger:operation GET /api/analog_inputs/{id} AnalogInput analogInputGet
	// Get an Analog Input by id.
	// Get an existing Analog Input.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the analog input
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/analogInput'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/analog_inputs/{id}", c.get).Methods("GET")

	// swagger:operation PUT /api/analog_inputs AnalogInput analogInputCreate
	// Create an analog input.
	// Create a new analog input.
	// ---
	// parameters:
	//  - in: body
	//    name: analog input
	//    description: The analog input to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/analogInput'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/analog_inputs", c.create).Methods("PUT")

	//swagger:operation POST /api/analog_inputs/{id} AnalogInput analogInputUpdate
	// Update an Analog Input.
	// Update an existing Analog Input.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the analog input to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: analog input
	//   description: The analog input to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/analogInput'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/analog_inputs/{id}", c.update).Methods("POST")

	// swagger:operation DELETE /api/analog_inputs/{id} AnalogInput analogInputDelete
	// Delete an Analog Input.
	// Delete an existing Analog Input.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the analog input to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/analog_inputs/{id}", c.delete).Methods("DELETE")

	// swagger:operation POST /api/analog_inputs/{id}/read AnalogInput analogInputRead
	// Read an Analog Input.
	// Read an Analog Input.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the analog input to read
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/analog_inputs/{id}/read", c.read).Methods("POST")
}

func (ais *AnalogInputs) Read(id string) (float64, error) {
	j, err := ais.Get(id)
	if err != nil {
		return -1, err
	}
	ch, err := j.channel(ais.drivers)
	if err != nil {
		return -1, fmt.Errorf("pin %d on analog input %s has no driver: %v", j.Pin, id, err)
	}
	return ch.Value()
}
func (ais *AnalogInputs) Calibrate(id string, ms []hal.Measurement) error {
	j, err := ais.Get(id)
	if err != nil {
		return err
	}
	ch, err := j.channel(ais.drivers)
	if err != nil {
		return fmt.Errorf("pin %d on analog input %s has no driver: %v", j.Pin, id, err)
	}
	return ch.Calibrate(ms)
}

type AnalogReading struct {
	Value float64 `json:"value"`
}

func (c *AnalogInputs) read(w http.ResponseWriter, r *http.Request) {
	var a AnalogReading
	fn := func(id string) error {
		v, err := c.Read(id)
		a.Value = v
		return err
	}
	utils.JSONUpdateResponse(&a, fn, w, r)
}

func (c *AnalogInputs) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *AnalogInputs) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *AnalogInputs) create(w http.ResponseWriter, r *http.Request) {
	var j AnalogInput
	fn := func() error {
		return c.Create(j)
	}
	utils.JSONCreateResponse(&j, fn, w, r)
}

func (c *AnalogInputs) update(w http.ResponseWriter, r *http.Request) {
	var j AnalogInput
	fn := func(id string) error {
		return c.Update(id, j)
	}
	utils.JSONUpdateResponse(&j, fn, w, r)
}

func (c *AnalogInputs) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
