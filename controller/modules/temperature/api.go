package temperature

import (
	"net/http"
	"path/filepath"

	"github.com/gorilla/mux"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/utils"
)

var (
	mockSensors = []string{
		"/sys/bus/w1/devices/28-devmodeenable",
	}
)

func (t *Controller) LoadAPI(r *mux.Router) {

	// swagger:route GET /api/tcs Temperature tcsList
	// List all temperature controllers.
	// List all temperature controllers in reef-pi.
	// responses:
	// 	200: body:[]temperatureController
	r.HandleFunc("/api/tcs", t.list).Methods("GET")

	// swagger:route GET /api/tcs/sensors Temperature tcsList
	// List all temperature sensors.
	// List all temperature sensors detected by the OS.
	// responses:
	// 	200:
	//   description: An array of sensor ids
	r.HandleFunc("/api/tcs/sensors", t.sensors).Methods("GET")

	// swagger:operation PUT /api/tcs Temperature tcsCreate
	// Create a temperature controller.
	// Create a new temperature controller.
	// ---
	// parameters:
	//  - in: body
	//    name: temperatureController
	//    description: The temperature controller to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/temperatureController'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/tcs", t.create).Methods("PUT")

	// swagger:operation GET /api/tcs/{id} Temperature tcsGet
	// Get an temperature controller by id.
	// Get an existing temperature controller by id.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the temperature controller
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/temperatureController'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/tcs/{id}", t.get).Methods("GET")

	// swagger:operation GET /api/tcs/{id}/current_reading Temperature tcsRead
	// Get temperature controller reading.
	// Get temperature controller reading.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the temperature controller to read
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/tcs/{id}/current_reading", t.currentReading).Methods("GET")

	// swagger:operation GET /api/tcs/{id}/read Temperature tcsRead
	// Get temperature controller reading.
	// Get temperature controller reading.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the temperature controller to read
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/tcs/{id}/read", t.read).Methods("GET")

	// swagger:operation POST /api/tcs/{id} Temperature tcsUpdate
	// Update a temperature controller.
	// Update an existing temperature controller.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the temperature controller to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: temperatureController
	//   description: The temperature controller to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/temperatureController'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/tcs/{id}", t.update).Methods("POST")

	// swagger:operation DELETE /api/tcs/{id} Temperature tcsDelete
	// Delete a temperature controller.
	// Delete an existing temperature controller.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the temperature controller to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/tcs/{id}", t.delete).Methods("DELETE")

	// swagger:operation GET /api/tcs/{id}/usage Temperature tcsUsage
	// Get usage history.
	// Get usage history for a given temperature controller.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the temperature controller
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/tcs/{id}/usage", t.getUsage).Methods("GET")

	// swagger:operation POST /api/tcs/{id}/calibrate Temperature tcsCalibrate
	// Calibrate a temperature sensor.
	// Set calibration points for one or two point calibration
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the temperature controller with a sensor to calibrate
	//    required: true
	//    schema:
	//     type: integer
	//  - in: body
	//    name: measurements
	//    description: The calibration measurements
	//    required: true
	//    schema:
	//     type: array
	//     items:
	//      type: object
	//      properties:
	//       expected:
	//        type: float64
	//        format: float
	//        description: The expected value
	//       observed:
	//        type: float64
	//        format: float
	//        description: The actual value observed
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/tcs/{id}/calibrate", t.calibrate).Methods("POST")
}

func (t *Controller) currentReading(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		tc, err := t.Get(id)
		if err != nil {
			return nil, err
		}
		v := make(map[string]float64)
		v["temperature"] = tc.currentValue
		return v, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) read(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		tc, err := t.Get(id)
		if err != nil {
			return nil, err
		}
		return t.Read(tc)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (t *Controller) sensors(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		fs := mockSensors
		if !t.devMode {
			files, err := filepath.Glob("/sys/bus/w1/devices/28-*")
			if err != nil {
				return nil, err
			}
			fs = files
		}
		sensors := []string{}
		for _, f := range fs {
			sensors = append(sensors, filepath.Base(f))
		}
		return sensors, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var t TC
	fn := func() error {
		return c.Create(&t)
	}
	utils.JSONCreateResponse(&t, fn, w, r)
}

func (c *Controller) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (t *Controller) getUsage(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) { return t.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var t TC
	fn := func(id string) error {
		return c.Update(id, &t)
	}
	utils.JSONUpdateResponse(&t, fn, w, r)
}

func (c *Controller) calibrate(w http.ResponseWriter, r *http.Request) {
	var ms []hal.Measurement
	fn := func(id string) error {
		return c.Calibrate(id, ms)
	}
	utils.JSONUpdateResponse(&ms, fn, w, r)
}
