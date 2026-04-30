package connectors

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type jackRepository interface {
	Setup() error
	Get(string) (Jack, error)
	List() ([]Jack, error)
	Create(Jack) error
	Update(string, Jack) error
	Delete(string) error
}

type storeJackRepository struct {
	store storage.Store
}

func newJackRepository(store storage.Store) jackRepository {
	return storeJackRepository{store: store}
}

func (r storeJackRepository) Setup() error {
	return r.store.CreateBucket(JackBucket)
}

func (r storeJackRepository) Get(id string) (Jack, error) {
	var j Jack
	return j, r.store.Get(JackBucket, id, &j)
}

func (r storeJackRepository) List() ([]Jack, error) {
	jacks := []Jack{}
	fn := func(_ string, v []byte) error {
		var j Jack
		if err := json.Unmarshal(v, &j); err != nil {
			return err
		}
		jacks = append(jacks, j)
		return nil
	}
	return jacks, r.store.List(JackBucket, fn)
}

func (r storeJackRepository) Create(j Jack) error {
	fn := func(id string) interface{} {
		j.ID = id
		return &j
	}
	return r.store.Create(JackBucket, fn)
}

func (r storeJackRepository) Update(id string, j Jack) error {
	j.ID = id
	return r.store.Update(JackBucket, id, j)
}

func (r storeJackRepository) Delete(id string) error {
	return r.store.Delete(JackBucket, id)
}
