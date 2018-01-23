package doser

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/doser/pumps", c.list).Methods("GET")
	r.HandleFunc("/api/doser/pumps/{id}", c.get).Methods("GET")
	r.HandleFunc("/api/doser/pumps", c.create).Methods("PUT")
	r.HandleFunc("/api/doser/pumps/{id}", c.update).Methods("POST")
	r.HandleFunc("/api/doser/pumps/{id}", c.delete).Methods("DELETE")
	r.HandleFunc("/api/doser/pumps/{id}/calibrate", c.calibrate).Methods("POST")
	r.HandleFunc("/api/doser/pumps/{id}/schedule", c.schedule).Methods("POST")
}

func (c *Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var p Pump
	fn := func() error {
		return c.Create(p)
	}
	utils.JSONCreateResponse(&p, fn, w, r)
}

func (c *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) calibrate(w http.ResponseWriter, r *http.Request) {
	var cal CalibrationDetails
	fn := func(id string) error {
		return c.Calibrate(id, cal)
	}
	utils.JSONUpdateResponse(&cal, fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var p Pump
	fn := func(id string) error {
		return c.Update(id, p)
	}
	utils.JSONUpdateResponse(&p, fn, w, r)
}

func (c *Controller) schedule(w http.ResponseWriter, r *http.Request) {
	var reg DosingRegiment
	fn := func(id string) error {
		return c.Schedule(id, reg)
	}
	utils.JSONUpdateResponse(&reg, fn, w, r)
}
