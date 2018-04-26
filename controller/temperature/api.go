package temperature

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
	"path/filepath"
)

func (t *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/tcs", t.list).Methods("GET")
	r.HandleFunc("/api/tcs/sensors", t.sensors).Methods("GET")
	r.HandleFunc("/api/tcs", t.create).Methods("PUT")
	r.HandleFunc("/api/tcs/{id}", t.get).Methods("GET")
	r.HandleFunc("/api/tcs/{id}", t.update).Methods("POST")
	r.HandleFunc("/api/tcs/{id}", t.delete).Methods("DELETE")
	r.HandleFunc("/api/tcs/{id}/usage", t.getUsage).Methods("GET")
}

func (t *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}
func (c Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (t *Controller) sensors(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		if t.devMode {
			return []string{"28-04177049bcff", "28-2392abcabcabc", "28-f0a0a0abbd4f"}, nil
		}
		files, err := filepath.Glob("/sys/bus/w1/devices/28-*")
		if err != nil {
			return nil, err
		}
		sensors := []string{}
		for _, f := range files {
			sensors = append(sensors, filepath.Base(f))
		}
		return sensors, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var t TC
	fn := func() error {
		return c.Create(t)
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

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var t TC
	fn := func(id string) error {
		return c.Update(id, t)
	}
	utils.JSONUpdateResponse(&t, fn, w, r)
}
