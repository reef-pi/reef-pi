package connectors

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type analogInputRepository interface {
	Setup() error
	Get(string) (AnalogInput, error)
	List() ([]AnalogInput, error)
	Create(AnalogInput) error
	Update(string, AnalogInput) error
	Delete(string) error
}

type storeAnalogInputRepository struct {
	store storage.Store
}

func newAnalogInputRepository(store storage.Store) analogInputRepository {
	return storeAnalogInputRepository{store: store}
}

func (r storeAnalogInputRepository) Setup() error {
	return r.store.CreateBucket(AnalogInputBucket)
}

func (r storeAnalogInputRepository) Get(id string) (AnalogInput, error) {
	var j AnalogInput
	return j, r.store.Get(AnalogInputBucket, id, &j)
}

func (r storeAnalogInputRepository) List() ([]AnalogInput, error) {
	ais := []AnalogInput{}
	fn := func(_ string, v []byte) error {
		var j AnalogInput
		if err := json.Unmarshal(v, &j); err != nil {
			return err
		}
		ais = append(ais, j)
		return nil
	}
	return ais, r.store.List(AnalogInputBucket, fn)
}

func (r storeAnalogInputRepository) Create(j AnalogInput) error {
	fn := func(id string) interface{} {
		j.ID = id
		return &j
	}
	return r.store.Create(AnalogInputBucket, fn)
}

func (r storeAnalogInputRepository) Update(id string, j AnalogInput) error {
	j.ID = id
	return r.store.Update(AnalogInputBucket, id, j)
}

func (r storeAnalogInputRepository) Delete(id string) error {
	return r.store.Delete(AnalogInputBucket, id)
}
