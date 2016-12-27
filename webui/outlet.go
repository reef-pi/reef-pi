package webui

import (
	"github.com/ranjib/reefer/controller"
	"net/http"
)

func (h *APIHandler) GetOutlet(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetOutlet(id)
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) ListOutlets(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return h.controller.ListOutlets()
	}
	h.jsonListResponse(fn, w, r)
}

func (h *APIHandler) CreateOutlet(w http.ResponseWriter, r *http.Request) {
	var o controller.Outlet
	fn := func() error {
		return h.controller.CreateOutlet(o)
	}
	h.jsonCreateResponse(&o, fn, w, r)
}

func (h *APIHandler) UpdateOutlet(w http.ResponseWriter, r *http.Request) {
	var o controller.Outlet
	fn := func(id string) error {
		o.ID = id
		return h.controller.UpdateOutlet(id, o)
	}
	h.jsonUpdateResponse(&o, fn, w, r)
}

func (h *APIHandler) DeleteOutlet(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.DeleteOutlet, w, r)
}

func (h *APIHandler) ConfigureOutlet(w http.ResponseWriter, r *http.Request) {
	var a controller.OuteltAction
	fn := func(id string) error {
		return h.controller.ConfigureOutlet(id, a)
	}
	h.jsonUpdateResponse(&a, fn, w, r)
}
