package ph

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (e *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/phprobes/{id}", e.getProbe).Methods("GET")
	r.HandleFunc("/api/phprobes", e.listProbes).Methods("GET")
	r.HandleFunc("/api/phprobes", e.createProbe).Methods("PUT")
	r.HandleFunc("/api/phprobes/{id}", e.updateProbe).Methods("POST")
	r.HandleFunc("/api/phprobes/{id}", e.deleteProbe).Methods("DELETE")
	r.HandleFunc("/api/phprobes/{id}/readings", e.getReadings).Methods("GET")
}

func (c *Controller) getProbe(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) getReadings(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.GetReadings(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c Controller) listProbes(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) createProbe(w http.ResponseWriter, r *http.Request) {
	var p Probe
	fn := func() error {
		return c.Create(p)
	}
	utils.JSONCreateResponse(&p, fn, w, r)
}

func (c *Controller) updateProbe(w http.ResponseWriter, r *http.Request) {
	var p Probe
	fn := func(id string) error {
		return c.Update(id, p)
	}
	utils.JSONUpdateResponse(&p, fn, w, r)
}

func (c *Controller) deleteProbe(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
