package macro

import (
	"errors"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (t *Subsystem) LoadAPI(r *mux.Router) {

	// swagger:route GET /api/macros Macros macroList
	// List all macros.
	// List all macros in reef-pi.
	// responses:
	// 	200: body:[]macro
	r.HandleFunc("/api/macros", t.list).Methods("GET")

	// swagger:operation PUT /api/macros Macros macroCreate
	// Create a macro.
	// Create a new macro.
	// ---
	// parameters:
	//  - in: body
	//    name: macro
	//    description: The macro to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/macro'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/macros", t.create).Methods("PUT")

	// swagger:operation GET /api/macros/{id} Macros macroGet
	// Get a macro by id.
	// Get an existing macro by id.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the macro
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/macro'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/macros/{id}", t.get).Methods("GET")

	// swagger:operation POST /api/macros/{id} Macros macroUpdate
	// Update a macro.
	// Update an existing macro.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the macro to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: macro
	//   description: The macro to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/macro'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/macros/{id}", t.update).Methods("POST")

	// swagger:operation DELETE /api/macros/{id} Macros macroDelete
	// Delete a macro.
	// Delete an existing macro.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the macro to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/macros/{id}", t.delete).Methods("DELETE")

	// swagger:operation POST /api/macros/{id}/run Macros macroRun
	// Run a macro.
	// Run a macro.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the macro to run
	//   required: true
	//   schema:
	//    type: integer
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/macros/{id}/run", t.run).Methods("POST")

	// swagger:operation POST /api/macros/{id}/revert Macros macroRevert
	// Reverse a macro.
	// Revert a macro in reverse.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the macro to revert
	//   required: true
	//   schema:
	//    type: integer
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/macros/{id}/revert", t.revert).Methods("POST")
}

func (t *Subsystem) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Subsystem) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Subsystem) create(w http.ResponseWriter, r *http.Request) {
	var m Macro
	fn := func() error {
		return c.Create(m)
	}
	utils.JSONCreateResponse(&m, fn, w, r)
}

func (c *Subsystem) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Subsystem) update(w http.ResponseWriter, r *http.Request) {
	var m Macro
	fn := func(id string) error {
		return c.Update(id, m)
	}
	utils.JSONUpdateResponse(&m, fn, w, r)
}

func (c *Subsystem) run(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		m, err := c.Get(id)
		if err != nil {
			return err
		}
		go c.Run(m, false)
		return nil
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Subsystem) revert(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		m, err := c.Get(id)
		if err != nil {
			return err
		}
		if !m.Reversible {
			return errors.New("macro is not reversible")
		}
		go c.Run(m, true)
		return nil
	}
	utils.JSONDeleteResponse(fn, w, r)
}
