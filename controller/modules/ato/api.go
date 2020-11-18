package ato

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r *mux.Router) {

	// swagger:operation GET /api/atos/{id} ATO atoGet
	// Get an ATO by id.
	// Get an existing ATO.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the ATO
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/ato'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/atos/{id}", c.get).Methods("GET")

	// swagger:route GET /api/atos ATO atoList
	// List all ATOs.
	// List all ATOs in reef-pi.
	// responses:
	// 	200: body:[]ato
	r.HandleFunc("/api/atos", c.list).Methods("GET")

	// swagger:operation PUT /api/atos ATO atoCreate
	// Create an ATO.
	// Create a new ATO.
	// ---
	// parameters:
	//  - in: body
	//    name: ato
	//    description: The ato to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/ato'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/atos", c.create).Methods("PUT")

	// swagger:operation POST /api/atos/{id} ATO atoUpdate
	// Update an ATO.
	// Update an existing ATO.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the ato to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: ato
	//   description: The ato to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/ato'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/atos/{id}", c.update).Methods("POST")

	// swagger:operation DELETE /api/atos/{id} ATO atoDelete
	// Delete an ATO.
	// Delete an existing ATO.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the ato to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/atos/{id}", c.delete).Methods("DELETE")

	// swagger:operation GET /api/atos/{id}/usage ATO atoUsage
	// Get usage history.
	// Get usage history for a given ATO.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the ato
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/atos/{id}/usage", c.getUsage).Methods("GET")
}

func (c *Controller) get(w http.ResponseWriter, r *http.Request) {

	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var a ATO
	fn := func() error {
		return c.Create(a)
	}
	utils.JSONCreateResponse(&a, fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var a ATO
	fn := func(id string) error {
		return c.Update(id, a)
	}
	utils.JSONUpdateResponse(&a, fn, w, r)
}

func (c *Controller) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) getUsage(w http.ResponseWriter, req *http.Request) {
	fn := func(id string) (interface{}, error) { return c.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, req)
}
