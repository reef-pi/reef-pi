package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
)

func (h *APIHandler) ListJobs(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	jobs, err := h.controller.Jobs().List()
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to retrieve jobs list", w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(jobs); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}
func (h *APIHandler) GetJob(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	jobID := vars["id"]
	j, err := h.controller.Jobs().Get(jobID)
	if err != nil {
		errorResponse(http.StatusBadRequest, "Job does not exist", w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(j); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) CreateJob(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	var j controller.Job
	if err := dec.Decode(&j); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.Jobs().Create(j); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) UpdateJob(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	jobID := vars["id"]
	dec := json.NewDecoder(r.Body)
	var j controller.Job
	if err := dec.Decode(&j); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	j.ID = jobID
	if err := h.controller.Jobs().Update(jobID, j); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to update job. Error:"+err.Error(), w)
		return
	}
}

func (h *APIHandler) DeleteJob(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	jobID := vars["id"]
	if err := h.controller.Jobs().Delete(jobID); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to delete job. Error:"+err.Error(), w)
		return
	}
}
