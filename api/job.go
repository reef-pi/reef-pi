package api

import (
	"github.com/reef-pi/reef-pi/controller"
	"net/http"
)

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
