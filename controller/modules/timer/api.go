package timer

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/timers/{id}", c.GetJob)
	r.Get("/api/timers", c.ListJobs)
	r.Put("/api/timers", c.CreateJob)
	r.Post("/api/timers/{id}", c.UpdateJob)
	r.Delete("/api/timers/{id}", c.DeleteJob)
}

func (c *Controller) GetJob(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) ListJobs(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) CreateJob(w http.ResponseWriter, r *http.Request) {
	var j Job
	fn := func() error {
		return c.Create(j)
	}
	utils.JSONCreateResponse(&j, fn, w, r)
}

func (c *Controller) UpdateJob(w http.ResponseWriter, r *http.Request) {
	var j Job
	fn := func(id string) error {
		j.ID = id
		return c.Update(id, j)
	}
	utils.JSONUpdateResponse(&j, fn, w, r)
}

func (c *Controller) DeleteJob(w http.ResponseWriter, r *http.Request) {
	utils.JSONDeleteResponse(c.Delete, w, r)
}
