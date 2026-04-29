package lighting

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (Light, error)
	List() ([]Light, error)
	Create(Light) (Light, error)
	Update(string, Light) error
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

func (r storeRepository) Get(id string) (Light, error) {
	var l Light
	return l, r.store.Get(Bucket, id, &l)
}

func (r storeRepository) List() ([]Light, error) {
	ls := []Light{}
	fn := func(_ string, v []byte) error {
		var l Light
		if err := json.Unmarshal(v, &l); err != nil {
			return err
		}
		ls = append(ls, l)
		return nil
	}
	return ls, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(l Light) (Light, error) {
	created := l
	fn := func(id string) interface{} {
		created.ID = id
		return &created
	}
	return created, r.store.Create(Bucket, fn)
}

func (r storeRepository) Update(id string, l Light) error {
	l.ID = id
	return r.store.Update(Bucket, id, l)
}

func (r storeRepository) Delete(id string) error {
	return r.store.Delete(Bucket, id)
}
