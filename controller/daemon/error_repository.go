package daemon

import (
	"encoding/json"
	"time"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type errorRepository interface {
	Setup() error
	List() ([]Error, error)
	Get(string) (Error, error)
	Delete(string) error
	Log(string, string) error
}

type storeErrorRepository struct {
	store storage.Store
}

func newErrorRepository(store storage.Store) errorRepository {
	return storeErrorRepository{store: store}
}

func (r storeErrorRepository) Setup() error {
	return r.store.CreateBucket(storage.ErrorBucket)
}

func (r storeErrorRepository) List() ([]Error, error) {
	errors := []Error{}
	fn := func(_ string, v []byte) error {
		var e Error
		if err := json.Unmarshal(v, &e); err != nil {
			return err
		}
		errors = append(errors, e)
		return nil
	}
	return errors, r.store.List(storage.ErrorBucket, fn)
}

func (r storeErrorRepository) Get(id string) (Error, error) {
	var e Error
	return e, r.store.Get(storage.ErrorBucket, id, &e)
}

func (r storeErrorRepository) Delete(id string) error {
	return r.store.Delete(storage.ErrorBucket, id)
}

func (r storeErrorRepository) Log(id, msg string) error {
	e, err := r.Get(id)
	if err != nil {
		e = Error{ID: id}
	}
	e.Message = msg
	e.Time = time.Now().Format("Jan 2 15:04:05")
	e.Count++
	return r.store.Update(storage.ErrorBucket, id, e)
}
