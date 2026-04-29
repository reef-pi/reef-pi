package macro

import (
	"encoding/json"
	"log"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (Macro, error)
	List() ([]Macro, error)
	Create(Macro) error
	Update(string, Macro) error
	Delete(string) error
}

type storeRepository struct {
	store storage.Store
}

func newRepository(store storage.Store) repository {
	return storeRepository{store: store}
}

func (r storeRepository) Setup() error {
	return r.store.CreateBucket(Bucket)
}

func (r storeRepository) Get(id string) (Macro, error) {
	var m Macro
	return m, r.store.Get(Bucket, id, &m)
}

func (r storeRepository) List() ([]Macro, error) {
	ms := []Macro{}
	fn := func(_ string, v []byte) error {
		var m Macro
		if err := json.Unmarshal(v, &m); err != nil {
			return err
		}
		ms = append(ms, m)
		return nil
	}
	return ms, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(m Macro) error {
	fn := func(id string) interface{} {
		m.ID = id
		return &m
	}
	return r.store.Create(Bucket, fn)
}

func (r storeRepository) Update(id string, m Macro) error {
	m.ID = id
	return r.store.Update(Bucket, id, m)
}

func (r storeRepository) Delete(id string) error {
	if err := r.store.Delete(Bucket, id); err != nil {
		return err
	}
	if err := r.store.Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  macro-subsystem: Failed to deleted usage details for macro:", id)
	}
	return nil
}
