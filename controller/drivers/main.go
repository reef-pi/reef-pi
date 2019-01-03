package drivers

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/rpi/i2c"
)

const DriverBucket = storage.DriverBucket

type Driver struct {
	ID     string          `json:"id"`
	Name   string          `json:"name"`
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

type Drivers struct {
	sync.Mutex
	drivers map[string]hal.Driver
	store   storage.Store
}

func NewDrivers(s settings.Settings, bus i2c.Bus, store storage.Store) (*Drivers, error) {
	if err := store.CreateBucket(DriverBucket); err != nil {
		return nil, err
	}
	d := &Drivers{
		drivers: make(map[string]hal.Driver),
		store:   store,
	}
	return d, d.load(s, bus)
}

func (d *Drivers) Get(name string) (hal.Driver, error) {
	driver, ok := d.drivers[name]
	if !ok {
		return nil, fmt.Errorf("driver by name %s not available", name)
	}
	return driver, nil
}

func (d *Drivers) Create(d1 Driver) error {
	fn := func(id string) interface{} {
		d1.ID = id
		return &d1
	}
	return d.store.Create(DriverBucket, fn)
}
func (d *Drivers) Update(id string, d1 Driver) error {
	d1.ID = id
	return d.store.Update(DriverBucket, id, d1)
}
func (d *Drivers) Delete(id string) error {
	_, err := d.Get(id)
	if err != nil {
		return err
	}
	return d.store.Delete(DriverBucket, id)
}

func (d *Drivers) register(s settings.Settings, b i2c.Bus, f Factory) error {
	r, err := f(s, b)
	if err != nil {
		return err
	}
	meta := r.Metadata()
	if meta.Name == "" {
		return fmt.Errorf("driver did not report a name")
	}
	if _, ok := d.drivers[meta.Name]; ok {
		return fmt.Errorf("driver name already taken: %s", meta.Name)
	}
	d.Lock()
	d.drivers[meta.Name] = r
	d.Unlock()
	return nil
}
func (d *Drivers) List() ([]Driver, error) {
	var ds []Driver
	fn := func(v []byte) error {
		var d1 Driver
		if err := json.Unmarshal(v, &d1); err != nil {
			return err
		}
		ds = append(ds, d1)
		return nil
	}
	return ds, d.store.List(DriverBucket, fn)
}
