package flow_meter

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/flow_meters", c.listFlowMeters).Methods("GET")
	r.HandleFunc("/api/flow_meters", c.createFlowMeter).Methods("PUT")
	r.HandleFunc("/api/flow_meters/{id}", c.getFlowMeter).Methods("GET")
	r.HandleFunc("/api/flow_meters/{id}", c.updateFlowMeter).Methods("POST")
	r.HandleFunc("/api/flow_meters/{id}", c.deleteFlowMeter).Methods("DELETE")
	r.HandleFunc("/api/flow_meters/{id}/readings", c.getReadings).Methods("GET")
}

func (c *Controller) getFlowMeter(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) listFlowMeters(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) createFlowMeter(w http.ResponseWriter, r *http.Request) {
	var f FlowMeter
	fn := func() error {
		return c.Create(f)
	}
	utils.JSONCreateResponse(&f, fn, w, r)
}

func (c *Controller) updateFlowMeter(w http.ResponseWriter, r *http.Request) {
	var f FlowMeter
	fn := func(id string) error {
		return c.Update(id, f)
	}
	utils.JSONUpdateResponse(&f, fn, w, r)
}

func (c *Controller) deleteFlowMeter(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) getReadings(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.statsMgr.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}
