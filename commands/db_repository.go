package main

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type dbRepository interface {
	Close() error
	RawGet(string, string) ([]byte, error)
	Buckets() ([]string, error)
	List(string) (map[string]json.RawMessage, error)
	Create(string, []byte) error
	Update(string, string, []byte) error
	Delete(string, string) error
}

type storeDBRepository struct {
	store storage.Store
}

func newDBRepository(store storage.Store) dbRepository {
	return storeDBRepository{store: store}
}

func (r storeDBRepository) Close() error {
	return r.store.Close()
}

func (r storeDBRepository) RawGet(bucket, id string) ([]byte, error) {
	return r.store.RawGet(bucket, id)
}

func (r storeDBRepository) Buckets() ([]string, error) {
	return r.store.Buckets()
}

func (r storeDBRepository) List(bucket string) (map[string]json.RawMessage, error) {
	res := make(map[string]json.RawMessage)
	fn := func(id string, bs []byte) error {
		res[id] = bs
		return nil
	}
	return res, r.store.List(bucket, fn)
}

func (r storeDBRepository) Create(bucket string, data []byte) error {
	fn := func(_ string) interface{} {
		return data
	}
	return r.store.Create(bucket, fn)
}

func (r storeDBRepository) Update(bucket, id string, data []byte) error {
	return r.store.RawUpdate(bucket, id, data)
}

func (r storeDBRepository) Delete(bucket, id string) error {
	return r.store.Delete(bucket, id)
}
