package api

import (
	"github.com/ranjib/reef-pi/controller"
	"net/http"
)

func (h *APIHandler) GetInlet(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetInlet(id)
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) ListInlets(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return h.controller.ListInlets()
	}
	h.jsonListResponse(fn, w, r)
}

func (h *APIHandler) CreateInlet(w http.ResponseWriter, r *http.Request) {
	var i controller.Inlet
	fn := func() error {
		return h.controller.CreateInlet(i)
	}
	h.jsonCreateResponse(&i, fn, w, r)
}

func (h *APIHandler) UpdateInlet(w http.ResponseWriter, r *http.Request) {
	var i controller.Inlet
	fn := func(id string) error {
		i.ID = id
		return h.controller.UpdateInlet(id, i)
	}
	h.jsonUpdateResponse(&i, fn, w, r)
}

func (h *APIHandler) DeleteInlet(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.DeleteInlet, w, r)
}

func (h *APIHandler) ReadInlet(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		in, err := h.controller.GetInlet(id)
		if err != nil {
			return nil, err
		}
		return h.controller.ReadFromInlet(&in)
	}
	h.jsonGetResponse(fn, w, r)
}
