package lighting

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/lighting/cycle", c.GetLightingCycle).Methods("GET")
	r.HandleFunc("/api/lighting/cycle", c.SetLightingCycle).Methods("POST")
	r.HandleFunc("/api/lighting/fixed", c.GetFixedLighting).Methods("GET")
	r.HandleFunc("/api/lighting/fixed", c.SetFixedLighting).Methods("POST")
}

func (c *Controller) GetLightingCycle(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return c.GetCycle()
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) SetLightingCycle(w http.ResponseWriter, r *http.Request) {
	var cy Cycle
	fn := func(id string) error {
		return c.SetCycle(cy)
	}
	utils.JSONUpdateResponse(&cy, fn, w, r)
}

func (c *Controller) GetFixedLighting(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.GetFixed()
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) SetFixedLighting(w http.ResponseWriter, r *http.Request) {
	var v Fixed
	fn := func(i string) error {
		return c.SetFixed(v)
	}
	utils.JSONUpdateResponse(&v, fn, w, r)
}
