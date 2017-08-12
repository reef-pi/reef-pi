package timer

import (
	"github.com/gorilla/mux"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	/*
		r.HandleFunc("/api/jobs/{id}", handler.GetJob).Methods("GET")
		r.HandleFunc("/api/jobs", handler.ListJobs).Methods("GET")
		r.HandleFunc("/api/jobs", handler.CreateJob).Methods("PUT")
		r.HandleFunc("/api/jobs/{id}", handler.UpdateJob).Methods("POST")
		r.HandleFunc("/api/jobs/{id}", handler.DeleteJob).Methods("DELETE")
	*/
}

/*
func (h *APIHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetJob(id)
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) ListJobs(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return h.controller.ListJobs()
	}
	h.jsonListResponse(fn, w, r)
}

func (h *APIHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	var j controller.Job
	fn := func() error {
		return h.controller.CreateJob(j)
	}
	h.jsonCreateResponse(&j, fn, w, r)
}

func (h *APIHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	var j controller.Job
	fn := func(id string) error {
		j.ID = id
		return h.controller.UpdateJob(id, j)
	}
	h.jsonUpdateResponse(&j, fn, w, r)
}

func (h *APIHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.DeleteJob, w, r)
}
*/
