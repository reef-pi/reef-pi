package ph

import (
	"encoding/json"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (Probe, error)
	List() ([]Probe, error)
	Create(Probe) (Probe, error)
	Update(string, Probe) error
	Delete(string) error
	GetCalibration(string) ([]hal.Measurement, error)
	ListCalibrations() (map[string][]hal.Measurement, error)
	SaveCalibration(string, []hal.Measurement) error
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
	return r.store.CreateBucket(ReadingsBucket)
}

func (r storeRepository) Get(id string) (Probe, error) {
	var p Probe
	return p, r.store.Get(Bucket, id, &p)
}

func (r storeRepository) List() ([]Probe, error) {
	probes := []Probe{}
	fn := func(_ string, v []byte) error {
		var p Probe
		if err := json.Unmarshal(v, &p); err != nil {
			return err
		}
		probes = append(probes, p)
		return nil
	}
	return probes, r.store.List(Bucket, fn)
}

func (r storeRepository) Create(p Probe) (Probe, error) {
	created := p
	fn := func(id string) interface{} {
		created.ID = id
		return &created
	}
	return created, r.store.Create(Bucket, fn)
}

func (r storeRepository) Update(id string, p Probe) error {
	p.ID = id
	return r.store.Update(Bucket, id, p)
}

func (r storeRepository) Delete(id string) error {
	if err := r.store.Delete(Bucket, id); err != nil {
		return err
	}
	r.store.Delete(CalibrationBucket, id)
	return nil
}

func (r storeRepository) GetCalibration(id string) ([]hal.Measurement, error) {
	var calibration []hal.Measurement
	return calibration, r.store.Get(CalibrationBucket, id, &calibration)
}

func (r storeRepository) ListCalibrations() (map[string][]hal.Measurement, error) {
	calibrations := map[string][]hal.Measurement{}
	fn := func(id string, v []byte) error {
		var ms []hal.Measurement
		if err := json.Unmarshal(v, &ms); err != nil {
			return err
		}
		calibrations[id] = ms
		return nil
	}
	return calibrations, r.store.List(CalibrationBucket, fn)
}

func (r storeRepository) SaveCalibration(id string, ms []hal.Measurement) error {
	return r.store.Update(CalibrationBucket, id, ms)
}
