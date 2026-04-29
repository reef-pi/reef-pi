package camera

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	LoadConfig() (Config, error)
	SaveConfig(Config) error
	Latest() (map[string]string, error)
	SaveLatest(string) error
	ListItems() ([]ImageItem, error)
	CreateItem(ImageItem) error
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
	return r.store.CreateBucket(ItemBucket)
}

func (r storeRepository) LoadConfig() (Config, error) {
	var conf Config
	return conf, r.store.Get(Bucket, "config", &conf)
}

func (r storeRepository) SaveConfig(conf Config) error {
	if err := validateConfig(conf); err != nil {
		return err
	}
	return r.store.Update(Bucket, "config", conf)
}

func (r storeRepository) Latest() (map[string]string, error) {
	data := map[string]string{}
	return data, r.store.Get(Bucket, "latest", &data)
}

func (r storeRepository) SaveLatest(name string) error {
	data := map[string]string{
		"image": name,
	}
	return r.store.Update(Bucket, "latest", data)
}

func (r storeRepository) ListItems() ([]ImageItem, error) {
	items := []ImageItem{}
	fn := func(_ string, v []byte) error {
		var i ImageItem
		if err := json.Unmarshal(v, &i); err != nil {
			return err
		}
		items = append(items, i)
		return nil
	}
	return items, r.store.List(ItemBucket, fn)
}

func (r storeRepository) CreateItem(item ImageItem) error {
	fn := func(id string) interface{} {
		item.ID = id
		return &item
	}
	return r.store.Create(ItemBucket, fn)
}
