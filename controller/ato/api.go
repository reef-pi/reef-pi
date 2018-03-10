package ato

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/atos/{id}", c.get).Methods("GET")
	r.HandleFunc("/api/atos", c.list).Methods("GET")
	r.HandleFunc("/api/atos", c.create).Methods("PUT")
	r.HandleFunc("/api/atos/{id}", c.update).Methods("POST")
	r.HandleFunc("/api/atos/{id}", c.delete).Methods("DELETE")
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
