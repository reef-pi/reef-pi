package equipment

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (Equipment, error)
	List() ([]Equipment, error)
	Create(Equipment) (Equipment, error)
	Update(string, Equipment) error
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

func (r storeRepository) Get(id string) (Equipment, error) {
	var eq Equipment
	return eq, r.store.Get(Bucket, id, &eq)
}

func (r storeRepository) List() ([]Equipment, error) {
	equipment := []Equipment{}
	fn := func(_ string, v []byte) error {
		var eq Equipment
		if err := json.Unmarshal(v, &eq); err != nil {
			return err
		}
		equipment = append(equipment, eq)
		return nil
	}
	return equipment, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(eq Equipment) (Equipment, error) {
	created := eq
	fn := func(id string) interface{} {
		created.ID = id
		return &created
	}
	err := r.store.Create(Bucket, fn)
	return created, err
}

func (r storeRepository) Update(id string, eq Equipment) error {
	eq.ID = id
	return r.store.Update(Bucket, id, eq)
}

func (r storeRepository) Delete(id string) error {
	return r.store.Delete(Bucket, id)
}
