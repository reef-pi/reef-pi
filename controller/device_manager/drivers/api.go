package drivers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (d *Drivers) LoadAPI(r *mux.Router) {

	// swagger:route GET /api/drivers Driver driverList
	// List all Drivers.
	// List all Drivers in reef-pi.
	// responses:
	// 	200: body:[]driver
	// 	500:
	r.HandleFunc("/api/drivers", d.list).Methods("GET")

	// swagger:operation GET /api/drivers/options Driver driverListOptions
	// Get driver parametres
	// List all drivers with configuration options.
	// ---
	// responses:
	//  200:
	//   description: Map of drivers and parameters
	//   schema:
	//    type: object
	//    additionalProperties:
	//     type: array
	//     items:
	//      type: object
	//      properties:
	//       name:
	//        type: string
	//        example: address
	//        description: The name of the parameter
	//       type:
	//        type: string
	//        example: string
	//        description: The data type of the parameter
	//       order:
	//        type: integer
	//        example: 1
	//        description: The order in which to display the parameter
	//       default:
	//        type: object
	//        example: 192.168.1.23:9999
	//        description: The recommended default value
	r.HandleFunc("/api/drivers/options", d.listOptions).Methods("GET")

	// swagger:operation GET /api/drivers/{id} Driver driverGet
	// Get a driver by id.
	// Get an existing driver.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the driver
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/driver'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/drivers/{id:[0-9]+}", d.get).Methods("GET")

	// swagger:operation PUT /api/drivers Driver driverCreate
	// Create a Driver.
	// Create a new Driver.
	// ---
	// parameters:
	//  - in: body
	//    name: driver
	//    description: The driver to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/driver'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/drivers", d.create).Methods("PUT")

	// swagger:operation DELETE /api/drivers/{id} Driver driverDelete
	// Delete an Driver.
	// Delete an existing Driver.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the driver to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/drivers/{id}", d.delete).Methods("DELETE")

	// swagger:operation POST /api/drivers/{id} Driver driverUpdate
	// Update a Driver.
	// Update an existing Driver.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the driver to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: driver
	//   description: The driver to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/driver'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/drivers/{id:[0-9]+}", d.update).Methods("POST")

	// swagger:operation POST /api/drivers/validate Driver driverValidate
	// Validate a driver configuration.
	// Validate a driver configuration.
	//---
	//parameters:
	// - in: body
	//   name: outlet
	//   description: The driver to validate
	//   required: true
	//   schema:
	//    $ref: '#/definitions/driver'
	//responses:
	// 200:
	//  description: OK
	// 400:
	//  description: Not Valid
	r.HandleFunc("/api/drivers/validate", d.validate).Methods("POST")
}

func (d *Drivers) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		ds, err := d.List()
		if err == nil {
			dr, ok := d.drivers[_rpi]
			if ok {
				piDriver.loadPinMap(dr)
			}
			ds = append(ds, piDriver)
		}
		return ds, err
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) listOptions(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		ds, err := d.ListOptions()
		return ds, err
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) validate(w http.ResponseWriter, r *http.Request) {
	var d1 Driver

	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&d1); err != nil {
		utils.ErrorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}

	var failures = make(map[string]string)
	drivers, err := d.List()
	for _, driver := range drivers {
		if driver.Name == d1.Name && driver.ID != d1.ID {
			failures["name"] = "The name " + d1.Name + " is already in use"
		}
	}

	errs, err := d.ValidateParameters(d1)
	if err != nil {
		utils.ErrorResponse(http.StatusBadRequest, err.Error(), w)
	}
	for k, v := range errs {
		failures["config."+strings.ToLower(k)] = strings.Join(v, "\n")
	}
	if len(failures) > 0 {
		utils.JSONResponseWithStatus(http.StatusBadRequest, failures, w, r)
	} else {
		utils.JSONResponseWithStatus(http.StatusOK, nil, w, r)
	}
}

func (d *Drivers) get(w http.ResponseWriter, r *http.Request) {

	var dr Driver
	fn := func(id string) (interface{}, error) {
		if err := d.store.Get(DriverBucket, id, &dr); err != nil {
			return nil, err
		}
		return dr, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (d *Drivers) update(w http.ResponseWriter, r *http.Request) {
	var d1 Driver
	fn := func(id string) error {
		return d.Update(id, d1)
	}
	utils.JSONUpdateResponse(&d1, fn, w, r)
}

func (d *Drivers) create(w http.ResponseWriter, r *http.Request) {
	var d1 Driver
	fn := func() error {
		return d.Create(d1)
	}
	utils.JSONCreateResponse(&d1, fn, w, r)
}

func (d *Drivers) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return d.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
