package api

import (
	"github.com/ranjib/reef-pi/controller"
	"net/http"
)

func (h *APIHandler) GetATOConfig(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetATOConfig(id)
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) ListATOConfigs(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return h.controller.ListATOConfigs()
	}
	h.jsonListResponse(fn, w, r)
}

func (h *APIHandler) CreateATOConfig(w http.ResponseWriter, r *http.Request) {
	var c controller.ATOConfig
	fn := func() error {
		return h.controller.CreateATOConfig(c)
	}
	h.jsonCreateResponse(&c, fn, w, r)
}

func (h *APIHandler) UpdateATOConfig(w http.ResponseWriter, r *http.Request) {
	var c controller.ATOConfig
	fn := func(id string) error {
		c.ID = id
		return h.controller.UpdateATOConfig(id, c)
	}
	h.jsonUpdateResponse(&c, fn, w, r)
}

func (h *APIHandler) DeleteATOConfig(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.DeleteATOConfig, w, r)
}

func (h *APIHandler) StartATO(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.StartATO, w, r)
}
func (h *APIHandler) StopATO(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.StopATO, w, r)
}
