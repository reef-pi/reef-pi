package temperature

import (
	"encoding/json"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	List() ([]*TC, error)
	Create(*TC) error
	Update(string, *TC) error
	Delete(string) error
	DeleteUsage(string) error
	ListCalibrations() (map[string][]hal.Measurement, error)
	UpdateCalibration(string, []hal.Measurement) error
	DeleteCalibration(string) error
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
	if err := r.store.CreateBucket(CalibrationBucket); err != nil {
		return err
	}
	return r.store.CreateBucket(UsageBucket)
}

func (r storeRepository) List() ([]*TC, error) {
	tcs := []*TC{}
	fn := func(_ string, v []byte) error {
		var tc TC
		if err := json.Unmarshal(v, &tc); err != nil {
			return err
		}
		tcs = append(tcs, &tc)
		return nil
	}
	return tcs, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(tc *TC) error {
	fn := func(id string) interface{} {
		tc.ID = id
		return tc
	}
	return r.store.Create(Bucket, fn)
}

func (r storeRepository) Update(id string, tc *TC) error {
	tc.ID = id
	return r.store.Update(Bucket, id, tc)
}

func (r storeRepository) Delete(id string) error {
	return r.store.Delete(Bucket, id)
}

func (r storeRepository) DeleteUsage(id string) error {
	return r.store.Delete(UsageBucket, id)
}

func (r storeRepository) ListCalibrations() (map[string][]hal.Measurement, error) {
	calibrations := map[string][]hal.Measurement{}
	err := r.store.List(CalibrationBucket, func(k string, v []byte) error {
		var ms []hal.Measurement
		if err := json.Unmarshal(v, &ms); err != nil {
			return err
		}
		calibrations[k] = ms
		return nil
	})
	return calibrations, err
}

func (r storeRepository) UpdateCalibration(sensor string, ms []hal.Measurement) error {
	return r.store.Update(CalibrationBucket, sensor, ms)
}

func (r storeRepository) DeleteCalibration(sensor string) error {
	return r.store.Delete(CalibrationBucket, sensor)
}
