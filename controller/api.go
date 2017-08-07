package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/capabilities", c.GetCapabilities).Methods("GET")
	r.HandleFunc("/api/info", c.GetSummary).Methods("GET")
}

func (t *Controller) GetCapabilities(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.Capabilities(), nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) GetSummary(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.ComputeSummary(), nil
	}
	utils.JSONGetResponse(fn, w, r)
}
