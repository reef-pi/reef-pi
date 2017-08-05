package api

import (
	"github.com/reef-pi/reef-pi/controller"
	"log"
	"net/http"
)

func (h *APIHandler) GetEquipment(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetEquipment(id)
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) ListEquipments(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return h.controller.ListEquipments()
	}
	h.jsonListResponse(fn, w, r)
}

func (h *APIHandler) CreateEquipment(w http.ResponseWriter, r *http.Request) {
	var e controller.Equipment
	fn := func() error {
		return h.controller.CreateEquipment(e)
	}
	log.Println("Creating equipment")
	h.jsonCreateResponse(&e, fn, w, r)
}

func (h *APIHandler) UpdateEquipment(w http.ResponseWriter, r *http.Request) {
	var e controller.Equipment
	fn := func(id string) error {
		e.ID = id
		return h.controller.UpdateEquipment(id, e)
	}
	h.jsonUpdateResponse(&e, fn, w, r)
}

func (h *APIHandler) DeleteEquipment(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.DeleteEquipment, w, r)
}
