package lighting

import (
	"github.com/gorilla/mux"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	/*
		r.HandleFunc("/api/lighting/cycle", c.GetLightingCycle).Methods("GET")
		r.HandleFunc("/api/lighting/cycle", c.SetLightingCycle).Methods("POST")
		r.HandleFunc("/api/lighting/fixed", c.GetFixedLighting).Methods("GET")
		r.HandleFunc("/api/lighting/fixed", c.SetFixedLighting).Methods("POST")
	*/
}

/*

func (h *APIHandler) GetLightingCycle(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetLightingCycle()
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) SetLightingCycle(w http.ResponseWriter, r *http.Request) {
	var c lighting.CycleConfig
	fn := func(id string) error {
		return h.controller.SetLightingCycle(c)
	}
	h.jsonUpdateResponse(&c, fn, w, r)
}

func (h *APIHandler) GetFixedLighting(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetFixedLighting()
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) SetFixedLighting(w http.ResponseWriter, r *http.Request) {
	var v lighting.FixedConfig
	fn := func(i string) error {
		return h.controller.SetFixedLighting(v)
	}
	h.jsonUpdateResponse(&v, fn, w, r)
}
*/
