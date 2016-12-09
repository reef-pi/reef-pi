package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func (h *APIHandler) SaveBoardConfiguration(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	vars := mux.Vars(r)
	board := vars["id"]
	log.Println("Saving configuration for:", board)

	dec := json.NewDecoder(r.Body)
	var payload map[string]string
	if err := dec.Decode(&payload); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.Boards().Update(board, payload); err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
}
func (h *APIHandler) GetBoardConfiguration(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	board := vars["id"]
	log.Println("Get configuration for:", board)
	pinLayout, err := h.controller.Boards().Get(board)
	if err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
	enc := json.NewEncoder(w)
	if err := enc.Encode(pinLayout); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
}

func (h *APIHandler) SaveOutletConfiguration(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	var payload map[string]string
	if err := dec.Decode(&payload); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.Outlets().Update(payload); err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
}
func (h *APIHandler) GetOutletConfiguration(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	outlets, err := h.controller.Outlets().Get()
	if err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
	enc := json.NewEncoder(w)
	if err := enc.Encode(outlets); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
}
