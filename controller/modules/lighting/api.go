package lighting

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) Usage(id string) (telemetry.StatsResponse, error) {
	return c.statsMgr.Get(id)
}

// LoadAPI is a no-op: lighting routes are owned by the generated OA3 handler in controller/api.
func (c *Controller) LoadAPI(_ chi.Router) {}

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
