package equipments

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

//API
func (e *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/equipments/{id}", e.GetEquipment).Methods("GET")
	r.HandleFunc("/api/equipments", e.ListEquipments).Methods("GET")
	r.HandleFunc("/api/equipments", e.CreateEquipment).Methods("PUT")
	r.HandleFunc("/api/equipments/{id}", e.UpdateEquipment).Methods("POST")
	r.HandleFunc("/api/equipments/{id}", e.DeleteEquipment).Methods("DELETE")

	r.HandleFunc("/api/outlets/{id}", e.getOutlet).Methods("GET")
	r.HandleFunc("/api/outlets", e.listOutlets).Methods("GET")
	r.HandleFunc("/api/outlets", e.createOutlet).Methods("PUT")
	r.HandleFunc("/api/outlets/{id}", e.deleteOutlet).Methods("DELETE")
	r.HandleFunc("/api/outlets/{id}", e.updateOutlet).Methods("POST")
}

func (c *Controller) getOutlet(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.GetOutlet(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) listOutlets(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.ListOutlets()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) updateOutlet(w http.ResponseWriter, r *http.Request) {
	var o Outlet
	fn := func(id string) error {
		return c.UpdateOutlet(id, o)
	}
	utils.JSONUpdateResponse(&o, fn, w, r)
}

func (c *Controller) createOutlet(w http.ResponseWriter, r *http.Request) {
	var o Outlet
	fn := func() error {
		return c.CreateOutlet(o)
	}
	utils.JSONCreateResponse(&o, fn, w, r)
}

func (c *Controller) deleteOutlet(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.DeleteOutlet(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
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
	utils.JSONUpdateResponse(&eq, fn, w, r)
}

func (c *Controller) DeleteEquipment(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
