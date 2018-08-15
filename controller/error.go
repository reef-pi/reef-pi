package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
	"time"
)

type Error struct {
	Message string    `json:"message"`
	Time    time.Time `json:"time"`
}

func (r *ReefPi) clearErrors(w http.ResponseWriter, req *http.Request) {
}

func (r *ReefPi) listErrors(w http.ResponseWriter, req *http.Request) {
}

func (r *ReefPi) getError(w http.ResponseWriter, req *http.Request) {
	fn := func(id string) (interface{}, error) {
		return r.GetError(id)
	}
	utils.JSONGetResponse(fn, w, req)
}
func (r *ReefPi) deleteError(w http.ResponseWriter, req *http.Request) {
}

func (r *ReefPi) GetError(id string) (Error, error) {
	return Error{}, nil
}
