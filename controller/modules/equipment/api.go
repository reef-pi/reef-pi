package equipment

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

// API
func (e *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/equipment/{id}", e.GetEquipment)
	r.Get("/api/equipment", e.ListEquipment)
	r.Put("/api/equipment", e.CreateEquipment)
	r.Post("/api/equipment/{id}", e.UpdateEquipment)
	r.Delete("/api/equipment/{id}", e.DeleteEquipment)
	r.Post("/api/equipment/{id}/control", e.control)
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
