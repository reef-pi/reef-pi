package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/types"
)

type Error struct {
	Message string `json:"message"`
	Time    string `json:"time"`
	Count   int    `json:"count"`
	ID      string `json:"id"`
}

func (r *ReefPi) setUpErrorBucket() error {
	return r.store.CreateBucket(types.ErrorBucket)
}

func (r *ReefPi) DeleteErrors() error {
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

func (r *ReefPi) clearErrors(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) error {
		return r.DeleteErrors()
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
		return r.GetError(id)
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
	return logError(r.store, id, msg)
}

func logError(store types.Store, id, msg string) error {
	e := Error{
		Message: msg,
		ID:      id,
		Time:    time.Now().Format("Jan 2 15:04:05"),
	}
	return store.Update(types.ErrorBucket, id, e)
}

func (r *ReefPi) GetError(id string) (Error, error) {
	var a Error
	return a, r.store.Get(types.ErrorBucket, id, &a)
}
