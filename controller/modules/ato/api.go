package ato

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/atos/{id}", c.get)
	r.Get("/api/atos", c.list)
	r.Put("/api/atos", c.create)
	r.Post("/api/atos/{id}", c.update)
	r.Delete("/api/atos/{id}", c.delete)
	r.Get("/api/atos/{id}/usage", c.getUsage)
	r.Post("/api/atos/{id}/reset", c.reset)
}

func (c *Controller) get(w http.ResponseWriter, r *http.Request) {

	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) list(w http.ResponseWriter, r *http.Request) {
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

func (c *Controller) reset(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Reset(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
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
