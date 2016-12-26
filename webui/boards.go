package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
)

func (h *APIHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	b, err := h.controller.GetBoard(id)
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

func (h *APIHandler) ListBoards(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	list, err := h.controller.ListBoards()
	if err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return

	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(list); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	var b controller.Board
	if err := dec.Decode(&b); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.CreateBoard(b); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to create board. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) UpdateBoard(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	dec := json.NewDecoder(r.Body)
	var b controller.Board
	if err := dec.Decode(&b); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	b.ID = id
	if err := h.controller.UpdateBoard(id, b); err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}
}

func (h *APIHandler) DeleteBoard(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	if err := h.controller.DeleteBoard(id); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to delete board. Error: "+err.Error(), w)
		return
	}
}
