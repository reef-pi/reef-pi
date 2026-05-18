package ph

import (
	"net/http"

	"github.com/reef-pi/hal"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) Readings(id string) (telemetry.StatsResponse, error) {
	return c.statsMgr.Get(id)
}

// LoadAPI is a no-op: ph routes are owned by the generated OA3 handler in controller/api.
func (e *Controller) LoadAPI(_ chi.Router) {}

func (c *Controller) calibrate(w http.ResponseWriter, r *http.Request) {
	var ms []hal.Measurement
	fn := func(id string) error {
		return c.Calibrate(id, ms)
	}
	utils.JSONUpdateResponse(&ms, fn, w, r)
}

func (c *Controller) calibratePoint(w http.ResponseWriter, r *http.Request) {
	var calibrationPoint CalibrationPoint
	fn := func(id string) error {
		return c.CalibratePoint(id, calibrationPoint)
	}
	utils.JSONUpdateResponse(&calibrationPoint, fn, w, r)
}

func (c *Controller) getProbe(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) getReadings(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) { return c.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) read(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		probe, err := c.Get(id)
		if err != nil {
			return nil, err
		}
		return c.Read(probe)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) listProbes(w http.ResponseWriter, r *http.Request) {
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
