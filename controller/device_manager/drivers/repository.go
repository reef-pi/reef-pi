package drivers

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type driverRepository struct {
	store storage.Store
}

func newDriverRepository(store storage.Store) (*driverRepository, error) {
	if err := store.CreateBucket(DriverBucket); err != nil {
		return nil, err
	}
	return &driverRepository{store: store}, nil
}

func (r *driverRepository) get(id string) (Driver, error) {
	var d Driver
	if err := r.store.Get(DriverBucket, id, &d); err != nil {
		return d, err
	}
	return d, nil
}

func (r *driverRepository) Get(bucket, id string, d interface{}) error {
	if bucket != DriverBucket {
		return storage.ErrDoesNotExist
	}
	return r.store.Get(DriverBucket, id, d)
}

func (r *driverRepository) create(d Driver) (Driver, error) {
	fn := func(id string) interface{} {
		d.ID = id
		return &d
	}
	if err := r.store.Create(DriverBucket, fn); err != nil {
		return d, err
	}
	return d, nil
}

func (r *driverRepository) update(id string, d Driver) error {
	d.ID = id
	return r.store.Update(DriverBucket, id, d)
}

func (r *driverRepository) delete(id string) error {
	return r.store.Delete(DriverBucket, id)
}

func (r *driverRepository) list() ([]Driver, error) {
	ds := []Driver{}
	fn := func(_ string, v []byte) error {
		var d Driver
		if err := json.Unmarshal(v, &d); err != nil {
			return err
		}
		ds = append(ds, d)
		return nil
	}
	return ds, r.store.List(DriverBucket, fn)
}
