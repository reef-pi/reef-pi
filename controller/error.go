package controller

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
	"time"
)

type Error struct {
	Message string    `json:"message"`
	Time    time.Time `json:"time"`
	Count   int       `json:"count"`
	ID      string    `json:"id"`
}

func (r *ReefPi) setUpErrorBucket() error {
	return r.store.CreateBucket(types.ErrorBucket)
}

func (r *ReefPi) clearErrors(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) error {
		errors, err := r.ListErrors()
		if err != nil {
			return err
		}
		for _, e := range errors {
			if err := r.DeleteError(e.ID); err != nil {
				log.Println("ERROR: failed to delete error:", err)
			}
		}
		return nil
	}
	utils.JSONDeleteResponse(fn, w, req)
}

func (r *ReefPi) ListErrors() ([]Error, error) {
	errors := []Error{}
	fn := func(v []byte) error {
		var a Error
		if err := json.Unmarshal(v, &a); err != nil {
			return err
		}
		errors = append(errors, a)
		return nil
	}
	return errors, r.store.List(types.ErrorBucket, fn)
}

func (r *ReefPi) listErrors(w http.ResponseWriter, req *http.Request) {
	fn := func() (interface{}, error) {
		return r.ListErrors()
	}
	utils.JSONListResponse(fn, w, req)
}

func (r *ReefPi) getError(w http.ResponseWriter, req *http.Request) {
	fn := func(id string) (interface{}, error) {
		var er Error
		return er, r.store.Get(types.ErrorBucket, id, &er)
	}
	utils.JSONGetResponse(fn, w, req)
}

func (r *ReefPi) deleteError(w http.ResponseWriter, req *http.Request) {
	utils.JSONDeleteResponse(r.DeleteError, w, req)
}

func (r *ReefPi) DeleteError(id string) error {
	return r.store.Delete(types.ErrorBucket, id)
}

func (r *ReefPi) LogError(id, msg string) error {
	e := Error{
		Message: msg,
		ID:      id,
		Time:    time.Now(),
	}
	return r.store.Update(types.ErrorBucket, id, e)
}

func (r *ReefPi) GetError(id string) (Error, error) {
	var a Error
	return a, r.store.Get(types.ErrorBucket, id, &a)
}
