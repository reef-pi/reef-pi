package temperature

import (
	"net/http"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

var (
	mockSensors = []string{
		"/sys/bus/w1/devices/28-devmodeenable",
		"/sys/bus/w1/devices/10-devmodeenable",
	}
)

// LoadAPI is a no-op: temperature routes are owned by the generated OA3 handler in controller/api.
func (t *Controller) LoadAPI(_ chi.Router) {}

func (t *Controller) currentReading(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		tc, err := t.Get(id)
		if err != nil {
			return nil, err
		}
		v := make(map[string]float64)
		v["temperature"] = tc.currentValue
		return v, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) read(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		tc, err := t.Get(id)
		if err != nil {
			return nil, err
		}
		return t.Read(tc)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (t *Controller) sensors(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.Sensors()
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) Sensors() ([]string, error) {
	fs := mockSensors
	if !t.devMode {
		files28, err := filepath.Glob("/sys/bus/w1/devices/28-*")
		if err != nil {
			return nil, err
		}
		files10, err := filepath.Glob("/sys/bus/w1/devices/10-*")
		if err != nil {
			return nil, err
		}
		fs = append(files28, files10...)
	}
	sensors := []string{}
	for _, f := range fs {
		sensors = append(sensors, filepath.Base(f))
	}
	return sensors, nil
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var t TC
	fn := func() error {
		return c.Create(&t)
	}
	utils.JSONCreateResponse(&t, fn, w, r)
}

func (c *Controller) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (t *Controller) getUsage(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) { return t.statsMgr.Get(id) }
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) Usage(id string) (telemetry.StatsResponse, error) {
	return t.statsMgr.Get(id)
}

func (t *Controller) CurrentReading(id string) (float64, error) {
	tc, err := t.Get(id)
	if err != nil {
		return 0, err
	}
	return tc.currentValue, nil
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var t TC
	fn := func(id string) error {
		return c.Update(id, &t)
	}
	utils.JSONUpdateResponse(&t, fn, w, r)
}

func (c *Controller) calibrate(w http.ResponseWriter, r *http.Request) {
	var ms []hal.Measurement
	fn := func(id string) error {
		return c.Calibrate(id, ms)
	}
	utils.JSONUpdateResponse(&ms, fn, w, r)
}
