package ato

import (
	"encoding/json"
	"log"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (ATO, error)
	List() ([]ATO, error)
	Create(ATO) (ATO, error)
	Update(string, ATO) error
	Delete(string) error
	DeleteUsage(string) error
}

type storeRepository struct {
	store storage.Store
}

func newRepository(store storage.Store) repository {
	return storeRepository{store: store}
}

func (r storeRepository) Setup() error {
	if err := r.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return r.store.CreateBucket(UsageBucket)
}

func (r storeRepository) Get(id string) (ATO, error) {
	var a ATO
	return a, r.store.Get(Bucket, id, &a)
}

func (r storeRepository) List() ([]ATO, error) {
	atos := []ATO{}
	fn := func(_ string, v []byte) error {
		var a ATO
		if err := json.Unmarshal(v, &a); err != nil {
			return err
		}
		atos = append(atos, a)
		return nil
	}
	return atos, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(a ATO) (ATO, error) {
	created := a
	fn := func(id string) interface{} {
		created.ID = id
		return &created
	}
	return created, r.store.Create(Bucket, fn)
}

func (r storeRepository) Update(id string, a ATO) error {
	a.ID = id
	return r.store.Update(Bucket, id, a)
}

func (r storeRepository) Delete(id string) error {
	if err := r.store.Delete(Bucket, id); err != nil {
		return err
	}
	if err := r.DeleteUsage(id); err != nil {
		log.Println("ERROR:  ato-subsystem: Failed to delete usage details for ato:", id)
	}
	return nil
}

func (r storeRepository) DeleteUsage(id string) error {
	return r.store.Delete(UsageBucket, id)
}
