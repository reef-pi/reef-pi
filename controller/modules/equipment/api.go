package equipment

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

// API
func (e *Controller) LoadAPI(r *mux.Router) {

	// swagger:operation GET /api/equipment/{id} Equipment equipmentGet
	// Get an equipment by id.
	// Get an existing equipment by id.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the equipment
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/equipment'
	//  404:
	//   description: Not Found
	r.HandleFunc("/api/equipment/{id}", e.GetEquipment).Methods("GET")

	// swagger:route GET /api/equipment Equipment equipmentList
	// List all equipment.
	// List all equipment in reef-pi.
	// responses:
	// 	200: body:[]equipment
	r.HandleFunc("/api/equipment", e.ListEquipment).Methods("GET")

	// swagger:operation PUT /api/equipment Equipment equipmentCreate
	// Create an equipment.
	// Create a new equipment.
	// ---
	// parameters:
	//  - in: body
	//    name: equipment
	//    description: The equipment to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/equipment'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/equipment", e.CreateEquipment).Methods("PUT")

	// swagger:operation POST /api/equipment Equipment equipmentUpdate
	// Update an equipment.
	// Update an existing equipment.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the equipment to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: equipment
	//   description: The equipment to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/equipment'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/equipment/{id}", e.UpdateEquipment).Methods("POST")

	// swagger:operation DELETE /api/equipment/{id} Equipment equipmentDelete
	// Delete an equipment.
	// Delete an existing equipment.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the equipment to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/equipment/{id}", e.DeleteEquipment).Methods("DELETE")

	// swagger:operation POST /api/equipment/{id}/control Equipment equipmentControl
	// Control an equipment.
	// Control an equipment.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the equipment to control
	//    required: true
	//    schema:
	//     type: integer
	//  - in: body
	//    name: action
	//    description: The action to take
	//    required: true
	//    schema:
	//     $ref: '#/definitions/equipmentAction'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/equipment/{id}/control", e.control).Methods("POST")
}

//swagger:model equipmentAction
type EquipmentAction struct {
	On bool `json:"on"`
}

func (c *Controller) Control(id string, on bool) error {
	e, err := c.Get(id)
	if err != nil {
		return nil
	}
	e.On = on
	return c.Update(e.ID, e)
}

func (c *Controller) control(w http.ResponseWriter, r *http.Request) {
	var action EquipmentAction
	fn := func(id string) error {
		return c.Control(id, action.On)
	}
	utils.JSONUpdateResponse(&action, fn, w, r)
}
func (c *Controller) GetEquipment(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c Controller) ListEquipment(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) CreateEquipment(w http.ResponseWriter, r *http.Request) {
	var eq Equipment
	fn := func() error {
		return c.Create(eq)
	}
	utils.JSONCreateResponse(&eq, fn, w, r)
}

func (c *Controller) UpdateEquipment(w http.ResponseWriter, r *http.Request) {
	var eq Equipment
	fn := func(id string) error {
		return c.Update(id, eq)
	}
	utils.JSONUpdateResponse(&eq, fn, w, r)
}

func (c *Controller) DeleteEquipment(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
