package doser

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/doser/pumps", c.list)
	r.Get("/api/doser/pumps/{id}", c.get)
	r.Put("/api/doser/pumps", c.create)
	r.Post("/api/doser/pumps/{id}", c.update)
	r.Delete("/api/doser/pumps/{id}", c.delete)
	r.Get("/api/doser/pumps/{id}/usage", c.getUsage)
	r.Post("/api/doser/pumps/{id}/calibrate", c.calibrate)
	r.Post("/api/doser/pumps/{id}/calibrate/save", c.calibrateSave)
	r.Post("/api/doser/pumps/{id}/schedule", c.schedule)
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

func (c *Controller) calibrateSave(w http.ResponseWriter, r *http.Request) {
	var cal CalibrationDetails
	fn := func(id string) error {
		return c.SaveCalibrationResult(id, cal)
	}
	utils.JSONUpdateResponse(&cal, fn, w, r)
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

func (c *Controller) getUsage(w http.ResponseWriter, req *http.Request) {
	fn := func(id string) (interface{}, error) { return c.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, req)
}
