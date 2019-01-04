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
	drivers  map[string]hal.Driver
	store    storage.Store
	dev_mode bool
	bus      i2c.Bus
}

func NewDrivers(s settings.Settings, bus i2c.Bus, store storage.Store) (*Drivers, error) {
	if err := store.CreateBucket(DriverBucket); err != nil {
		return nil, err
	}
	d := &Drivers{
		drivers:  make(map[string]hal.Driver),
		store:    store,
		dev_mode: s.Capabilities.DevMode,
		bus:      bus,
	}
	return d, d.loadAll()
}

func (d *Drivers) Get(name string) (hal.Driver, error) {
	driver, ok := d.drivers[name]
	if !ok {
		return nil, fmt.Errorf("driver by name %s not available", name)
	}
	return driver, nil
}

func (d *Drivers) InputDriver(id string) (hal.InputDriver, error) {
	driver, err := d.Get(id)
	if err != nil {
		return nil, err
	}
	i, ok := driver.(hal.InputDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an input driver", driver.Metadata().Name)
	}
	return i, nil
}

func (d *Drivers) OutputDriver(id string) (hal.OutputDriver, error) {
	driver, err := d.Get(id)
	if err != nil {
		return nil, err
	}
	o, ok := driver.(hal.OutputDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an Output driver", driver.Metadata().Name)
	}
	return o, nil
}

func (d *Drivers) PWMDriver(id string) (hal.PWMDriver, error) {
	driver, err := d.Get(id)
	if err != nil {
		return nil, err
	}
	p, ok := driver.(hal.PWMDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an PWM driver", driver.Metadata().Name)
	}
	return p, nil
}

func (d *Drivers) ADCDriver(id string) (hal.ADCDriver, error) {
	driver, err := d.Get(id)
	if err != nil {
		return nil, err
	}
	p, ok := driver.(hal.ADCDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an ADC driver", driver.Metadata().Name)
	}
	return p, nil
}

func (d *Drivers) Create(d1 Driver) error {
	fn := func(id string) interface{} {
		d1.ID = id
		return &d1
	}
	factory, err := AbstractFactory(d1.Type, d.dev_mode)
	if err != nil {
		return err
	}
	if err := d.store.Create(DriverBucket, fn); err != nil {
		return err
	}
	return d.register(d1.Config, factory)
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

func (d *Drivers) register(config []byte, f Factory) error {
	r, err := f(config, d.bus)
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
	ds := []Driver{
		Driver{
			Name: "Raspberry Pi",
			Type: "rpi",
		}}
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
