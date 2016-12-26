package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
)

func (h *APIHandler) GetOutlet(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	b, err := h.controller.GetOutlet(id)
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to get board. Error: "+err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(b); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) ListOutlets(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	list, err := h.controller.ListOutlets()
	if err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(list); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
}

func (h *APIHandler) CreateOutlet(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	var b controller.Outlet
	if err := dec.Decode(&b); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.CreateOutlet(b); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to create board. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) UpdateOutlet(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	dec := json.NewDecoder(r.Body)
	var o controller.Outlet
	if err := dec.Decode(&o); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	o.ID = id
	if err := h.controller.UpdateOutlet(id, o); err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
}

func (h *APIHandler) DeleteOutlet(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	if err := h.controller.DeleteOutlet(id); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to delete board. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) ConfigureOutlet(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	dec := json.NewDecoder(r.Body)
	var a controller.OuteltAction
	if err := dec.Decode(&a); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.ConfigureOutlet(id, a); err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
}
