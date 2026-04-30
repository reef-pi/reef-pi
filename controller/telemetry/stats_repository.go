package telemetry

import "github.com/reef-pi/reef-pi/controller/storage"

type statsRepository interface {
	Load(string, interface{}) error
	Save(string, interface{}) error
	Delete(string) error
}

type storeStatsRepository struct {
	store  storage.Store
	bucket string
}

func newStatsRepository(store storage.Store, bucket string) statsRepository {
	return storeStatsRepository{
		store:  store,
		bucket: bucket,
	}
}

func (r storeStatsRepository) Load(id string, v interface{}) error {
	return r.store.Get(r.bucket, id, v)
}

func (r storeStatsRepository) Save(id string, v interface{}) error {
	return r.store.Update(r.bucket, id, v)
}

func (r storeStatsRepository) Delete(id string) error {
	return r.store.Delete(r.bucket, id)
}
