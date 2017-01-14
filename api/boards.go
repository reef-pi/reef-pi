package api

import (
	"github.com/ranjib/reefer/controller"
	"net/http"
)

func (h *APIHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return h.controller.GetBoard(id)
	}
	h.jsonGetResponse(fn, w, r)
}

func (h *APIHandler) ListBoards(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return h.controller.ListBoards()
	}
	h.jsonListResponse(fn, w, r)
}

func (h *APIHandler) CreateBoard(w http.ResponseWriter, r *http.Request) {
	var b controller.Board
	fn := func() error {
		return h.controller.CreateBoard(b)
	}
	h.jsonCreateResponse(&b, fn, w, r)
}

func (h *APIHandler) UpdateBoard(w http.ResponseWriter, r *http.Request) {
	var b controller.Board
	fn := func(id string) error {
		b.ID = id
		return h.controller.UpdateBoard(id, b)
	}
	h.jsonUpdateResponse(&b, fn, w, r)
}

func (h *APIHandler) DeleteBoard(w http.ResponseWriter, r *http.Request) {
	h.jsonDeleteResponse(h.controller.DeleteBoard, w, r)
}
