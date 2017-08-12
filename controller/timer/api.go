package timer

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/timers/{id}", c.GetJob).Methods("GET")
	r.HandleFunc("/api/timers", c.ListJobs).Methods("GET")
	r.HandleFunc("/api/timers", c.CreateJob).Methods("PUT")
	r.HandleFunc("/api/timers/{id}", c.UpdateJob).Methods("POST")
	r.HandleFunc("/api/timers/{id}", c.DeleteJob).Methods("DELETE")
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
