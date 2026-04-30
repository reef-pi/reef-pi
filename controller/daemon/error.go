package daemon

import (
	"log"
	"net/http"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

//swagger:model error
type Error struct {
	Message string `json:"message"`
	Time    string `json:"time"`
	Count   int    `json:"count"`
	ID      string `json:"id"`
}

func (r *ReefPi) setUpErrorBucket() error {
	return newErrorRepository(r.store).Setup()
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
	return newErrorRepository(r.store).List()
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
	return newErrorRepository(r.store).Delete(id)
}

func (r *ReefPi) LogError(id, msg string) error {
	return logError(r.store, id, msg)
}

func logError(store storage.Store, id, msg string) error {
	return newErrorRepository(store).Log(id, msg)
}

func (r *ReefPi) GetError(id string) (Error, error) {
	return newErrorRepository(r.store).Get(id)
}
