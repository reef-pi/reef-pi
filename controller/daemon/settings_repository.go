package daemon

import (
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

const settingsKey = "settings"

type settingsRepository struct {
	store storage.Store
}

func newSettingsRepository(store storage.Store) settingsRepository {
	return settingsRepository{store: store}
}

func (r settingsRepository) Load() (settings.Settings, error) {
	var s settings.Settings
	return s, r.store.Get(Bucket, settingsKey, &s)
}

func (r settingsRepository) Setup(s settings.Settings) error {
	if err := r.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return r.Update(s)
}

func (r settingsRepository) Update(s settings.Settings) error {
	return r.store.Update(Bucket, settingsKey, s)
}
