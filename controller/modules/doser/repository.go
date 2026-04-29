package doser

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (Pump, error)
	List() ([]Pump, error)
	Create(Pump) (Pump, error)
	Update(string, Pump) error
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

func (r storeRepository) Get(id string) (Pump, error) {
	var p Pump
	return p, r.store.Get(Bucket, id, &p)
}

func (r storeRepository) List() ([]Pump, error) {
	pumps := []Pump{}
	fn := func(_ string, v []byte) error {
		var p Pump
		if err := json.Unmarshal(v, &p); err != nil {
			return err
		}
		pumps = append(pumps, p)
		return nil
	}
	return pumps, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(p Pump) (Pump, error) {
	created := p
	fn := func(id string) interface{} {
		created.ID = id
		return &created
	}
	return created, r.store.Create(Bucket, fn)
}

func (r storeRepository) Update(id string, p Pump) error {
	p.ID = id
	return r.store.Update(Bucket, id, p)
}

func (r storeRepository) Delete(id string) error {
	return r.store.Delete(Bucket, id)
}
