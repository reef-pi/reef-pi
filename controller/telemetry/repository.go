package telemetry

import "github.com/reef-pi/reef-pi/controller/storage"

type telemetryConfigRepository struct {
	store  storage.Store
	bucket string
}

func newTelemetryConfigRepository(store storage.Store, bucket string) *telemetryConfigRepository {
	return &telemetryConfigRepository{
		store:  store,
		bucket: bucket,
	}
}

func (t *telemetry) configRepository() *telemetryConfigRepository {
	if t.configRepo == nil {
		t.configRepo = newTelemetryConfigRepository(t.store, t.bucket)
	}
	return t.configRepo
}

func (r *telemetryConfigRepository) get() (TelemetryConfig, error) {
	var c TelemetryConfig
	err := r.store.Get(r.bucket, DBKey, &c)
	return c, err
}

func (r *telemetryConfigRepository) update(c TelemetryConfig) error {
	return r.store.Update(r.bucket, DBKey, c)
}
