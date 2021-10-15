package lighting

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r *mux.Router) {

	// swagger:route GET /api/lights Lights lightsList
	// List all lights.
	// List all lights in reef-pi.
	// responses:
	// 	200: body:[]light
	r.HandleFunc("/api/lights", c.ListLights).Methods("GET")

	// swagger:operation PUT /api/lights Lights lightsCreate
	// Create a light.
	// Create a new light.
	// ---
	// parameters:
	//  - in: body
	//    name: light
	//    description: The light to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/light'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/lights", c.CreateLight).Methods("PUT")

	// swagger:operation GET /api/lights/{id} Lights lightsGet
	// Get a light by id.
	// Get an existing light by id.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the light
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/light'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/lights/{id}", c.GetLight).Methods("GET")

	// swagger:operation POST /api/lights Lights lightUpdate
	// Update a light.
	// Update an existing light.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the light to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: light
	//   description: The light to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/light'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/lights/{id}", c.UpdateLight).Methods("POST")

	// swagger:operation DELETE /api/light/{id} Lights lightDelete
	// Delete a light.
	// Delete an existing light.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the light to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/lights/{id}", c.DeleteLight).Methods("DELETE")

	// swagger:operation GET /api/lights/{id}/usage light usage
	// Get usage history.
	// Get usage history for a given light.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the light
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/lights/{id}/usage", c.getUsage).Methods("GET")
}

func (c *Controller) GetLight(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) ListLights(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}
func (c *Controller) CreateLight(w http.ResponseWriter, r *http.Request) {
	var l Light
	fn := func() error {
		return c.Create(l)
	}
	utils.JSONCreateResponse(&l, fn, w, r)
}
func (c *Controller) UpdateLight(w http.ResponseWriter, r *http.Request) {
	var l Light
	fn := func(id string) error {
		return c.Update(id, l)
	}
	utils.JSONUpdateResponse(&l, fn, w, r)
}
func (c *Controller) DeleteLight(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) getUsage(w http.ResponseWriter, req *http.Request) {
	fn := func(id string) (interface{}, error) { return c.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, req)
}
