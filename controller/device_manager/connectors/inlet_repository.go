package connectors

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type inletRepository interface {
	Setup() error
	Get(string) (Inlet, error)
	List() ([]Inlet, error)
	Create(Inlet) error
	Update(string, Inlet) error
	Delete(string) error
}

type storeInletRepository struct {
	store storage.Store
}

func newInletRepository(store storage.Store) inletRepository {
	return storeInletRepository{store: store}
}

func (r storeInletRepository) Setup() error {
	return r.store.CreateBucket(InletBucket)
}

func (r storeInletRepository) Get(id string) (Inlet, error) {
	var i Inlet
	return i, r.store.Get(InletBucket, id, &i)
}

func (r storeInletRepository) List() ([]Inlet, error) {
	inlets := []Inlet{}
	fn := func(_ string, v []byte) error {
		var i Inlet
		if err := json.Unmarshal(v, &i); err != nil {
			return err
		}
		inlets = append(inlets, i)
		return nil
	}
	return inlets, r.store.List(InletBucket, fn)
}

func (r storeInletRepository) Create(i Inlet) error {
	fn := func(id string) interface{} {
		i.ID = id
		return &i
	}
	return r.store.Create(InletBucket, fn)
}

func (r storeInletRepository) Update(id string, i Inlet) error {
	i.ID = id
	return r.store.Update(InletBucket, id, i)
}

func (r storeInletRepository) Delete(id string) error {
	return r.store.Delete(InletBucket, id)
}
