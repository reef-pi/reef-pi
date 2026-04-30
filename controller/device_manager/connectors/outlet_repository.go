package connectors

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type outletRepository interface {
	Setup() error
	Get(string) (Outlet, error)
	List() ([]Outlet, error)
	Create(Outlet) error
	Update(string, Outlet) error
	Delete(string) error
}

type storeOutletRepository struct {
	store storage.Store
}

func newOutletRepository(store storage.Store) outletRepository {
	return storeOutletRepository{store: store}
}

func (r storeOutletRepository) Setup() error {
	return r.store.CreateBucket(OutletBucket)
}

func (r storeOutletRepository) Get(id string) (Outlet, error) {
	var o Outlet
	return o, r.store.Get(OutletBucket, id, &o)
}

func (r storeOutletRepository) List() ([]Outlet, error) {
	outlets := []Outlet{}
	fn := func(_ string, v []byte) error {
		var o Outlet
		if err := json.Unmarshal(v, &o); err != nil {
			return err
		}
		outlets = append(outlets, o)
		return nil
	}
	return outlets, r.store.List(OutletBucket, fn)
}

func (r storeOutletRepository) Create(o Outlet) error {
	fn := func(id string) interface{} {
		o.ID = id
		return &o
	}
	return r.store.Create(OutletBucket, fn)
}

func (r storeOutletRepository) Update(id string, o Outlet) error {
	o.ID = id
	return r.store.Update(OutletBucket, id, o)
}

func (r storeOutletRepository) Delete(id string) error {
	return r.store.Delete(OutletBucket, id)
}
