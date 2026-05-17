package lighting

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/lights", c.ListLights)
	r.Put("/api/lights", c.CreateLight)
	r.Get("/api/lights/{id}", c.GetLight)
	r.Post("/api/lights/{id}", c.UpdateLight)
	r.Delete("/api/lights/{id}", c.DeleteLight)
	r.Get("/api/lights/{id}/usage", c.getUsage)
}

func (c *Controller) GetLight(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) ListLights(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}
func (c *Controller) CreateLight(w http.ResponseWriter, r *http.Request) {
	var l Light
	fn := func() error {
		return c.Create(l)
	}
	utils.JSONCreateResponse(&l, fn, w, r)
}
func (c *Controller) UpdateLight(w http.ResponseWriter, r *http.Request) {
	var l Light
	fn := func(id string) error {
		return c.Update(id, l)
	}
	utils.JSONUpdateResponse(&l, fn, w, r)
}
func (c *Controller) DeleteLight(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) getUsage(w http.ResponseWriter, req *http.Request) {
	fn := func(id string) (interface{}, error) { return c.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, req)
}
