package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
)

func (h *APIHandler) ListEquipments(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	list, err := h.controller.ListEquipments()
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

func (h *APIHandler) GetEquipment(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	eq, err := h.controller.GetEquipment(id)
	if err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	enc := json.NewEncoder(w)
	if err := enc.Encode(eq); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
}

func (h *APIHandler) AddEquipment(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	var payload controller.Equipment
	if err := dec.Decode(&payload); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.CreateEquipment(payload); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to create equipment. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) UpdateEquipment(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	dec := json.NewDecoder(r.Body)
	var e controller.Equipment
	if err := dec.Decode(&e); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	e.ID = id
	if err := h.controller.UpdateEquipment(id, e); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to update equipment. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) RemoveEquipment(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	if err := h.controller.DeleteEquipment(id); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to delete equipment. Error: "+err.Error(), w)
		return
	}

}
