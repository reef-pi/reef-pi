package journal

import (
	"encoding/json"
	"log"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (Parameter, error)
	List() ([]Parameter, error)
	Create(Parameter) (Parameter, error)
	Update(string, Parameter) error
	Delete(string) error
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

func (r storeRepository) Get(id string) (Parameter, error) {
	var p Parameter
	return p, r.store.Get(Bucket, id, &p)
}

func (r storeRepository) List() ([]Parameter, error) {
	params := []Parameter{}
	fn := func(_ string, v []byte) error {
		var p Parameter
		if err := json.Unmarshal(v, &p); err != nil {
			return err
		}
		params = append(params, p)
		return nil
	}
	return params, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(p Parameter) (Parameter, error) {
	created := p
	fn := func(id string) interface{} {
		created.ID = id
		return &created
	}
	return created, r.store.Create(Bucket, fn)
}

func (r storeRepository) Update(id string, p Parameter) error {
	p.ID = id
	return r.store.Update(Bucket, id, p)
}

func (r storeRepository) Delete(id string) error {
	if err := r.store.Delete(Bucket, id); err != nil {
		return err
	}
	if err := r.store.Delete(UsageBucket, id); err != nil {
		log.Println("ERROR: journal-subsystem: Failed to deleted usage details for journal:", id)
	}
	return nil
}
