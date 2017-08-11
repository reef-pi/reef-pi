package equipments

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (e *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/equipments/{id}", e.GetEquipment).Methods("GET")
	r.HandleFunc("/api/equipments", e.ListEquipments).Methods("GET")
	r.HandleFunc("/api/equipments", e.CreateEquipment).Methods("PUT")
	r.HandleFunc("/api/equipments/{id}", e.UpdateEquipment).Methods("POST")
	r.HandleFunc("/api/equipments/{id}", e.DeleteEquipment).Methods("DELETE")
	r.HandleFunc("/api/outlets/{id}", e.GetOutlet).Methods("GET")
	r.HandleFunc("/api/outlets", e.ListOutlets).Methods("GET")
	r.HandleFunc("/api/outlets/{id}/configure", e.UpdateOutlet).Methods("POST")
}

type OutletAction struct {
	On    bool `json:"on"`
	Value int  `json:"value"`
}

func (c *Controller) GetOutlet(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		o, ok := c.config.Outlets[id]
		if !ok {
			return nil, fmt.Errorf("Outlate named:'%s' not found.", id)
		}
		return o, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) ListOutlets(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		list := []interface{}{}
		for _, o := range c.config.Outlets {
			o1 := o
			list = append(list, &o1)
		}
		return &list, nil
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) UpdateOutlet(w http.ResponseWriter, r *http.Request) {
	var a OutletAction
	fn := func(id string) error {
		return c.ConfigureOutlet(id, a.On)
	}
	utils.JSONUpdateResponse(a, fn, w, r)
}

func (c *Controller) GetEquipment(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c Controller) ListEquipments(w http.ResponseWriter, r *http.Request) {
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
	utils.JSONUpdateResponse(eq, fn, w, r)
}

func (c *Controller) DeleteEquipment(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
