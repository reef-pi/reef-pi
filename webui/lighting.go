package webui

import (
	"github.com/ranjib/reefer/controller"
	"net/http"
)

func (h *APIHandler) GetLighting(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetLighting(id)
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) ListLightings(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return h.controller.ListLightings()
	}
	h.jsonListResponse(fn, w, r)
}

func (h *APIHandler) CreateLighting(w http.ResponseWriter, r *http.Request) {
	var l controller.Lighting
	fn := func() error {
		return h.controller.CreateLighting(l)
	}
	h.jsonCreateResponse(&l, fn, w, r)
}

func (h *APIHandler) UpdateLighting(w http.ResponseWriter, r *http.Request) {
	var l controller.Lighting
	fn := func(id string) error {
		l.ID = id
		return h.controller.UpdateLighting(id, l)
	}
	h.jsonUpdateResponse(&l, fn, w, r)
}

func (h *APIHandler) DeleteLighting(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.DeleteLighting, w, r)
}

func (h *APIHandler) EnableLighting(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return h.controller.EnableLighting(id)
	}
	h.jsonDeleteResponse(fn, w, r)
}

func (h *APIHandler) DisableLighting(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return h.controller.DisableLighting(id)
	}
	h.jsonDeleteResponse(fn, w, r)
}
