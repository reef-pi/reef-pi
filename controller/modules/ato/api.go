package ato

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) Usage(id string) (telemetry.StatsResponse, error) {
	return c.statsMgr.Get(id)
}

// LoadAPI is a no-op: ato routes are owned by the generated OA3 handler in controller/api.
func (c *Controller) LoadAPI(_ chi.Router) {}

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
