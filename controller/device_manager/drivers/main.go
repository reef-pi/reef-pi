package drivers

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const (
	DriverBucket = storage.DriverBucket
	_rpi         = "rpi"
)

// swagger:model driver
type Driver struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	Type       string                 `json:"type"`
	Config     json.RawMessage        `json:"config"`
	PinMap     map[string][]int       `json:"pinmap"`
	Parameters map[string]interface{} `json:"parameters"`
}

type Drivers struct {
	sync.Mutex
	drivers  map[string]hal.Driver
	store    storage.Store
	dev_mode bool
	pwm_freq int
	bus      i2c.Bus
	t        telemetry.Telemetry
}

func NewDrivers(s settings.Settings, bus i2c.Bus, store storage.Store, t telemetry.Telemetry) (*Drivers, error) {
	if err := store.CreateBucket(DriverBucket); err != nil {
		return nil, err
	}
	d := &Drivers{
		drivers:  make(map[string]hal.Driver),
		store:    store,
		dev_mode: s.Capabilities.DevMode,
		pwm_freq: s.RPI_PWMFreq,
		bus:      bus,
		t:        t,
	}
	return d, d.loadAll()
}

func (d *Drivers) Get(id string) (Driver, error) {
	var dr Driver
	if err := d.store.Get(DriverBucket, id, &dr); err != nil {
		return dr, err
	}
	driver, ok := d.drivers[id]
	if !ok {
		return dr, fmt.Errorf("driver by id %s not available", id)
	}
	dr.loadPinMap(driver)
	return dr, nil
}

func (dr *Driver) loadPinMap(d hal.Driver) {
	pinmap := make(map[string][]int)
	for _, cap := range d.Metadata().Capabilities {
		pins, err := d.Pins(cap)
		if err != nil {
			continue
		}
		var ps []int
		for _, pin := range pins {
			ps = append(ps, pin.Number())
		}
		pinmap[cap.String()] = ps
	}
	dr.PinMap = pinmap
}

func (d *Drivers) DigitalInputDriver(id string) (hal.DigitalInputDriver, error) {
	driver, ok := d.drivers[id]
	if !ok {
		return nil, fmt.Errorf("driver by id %s not available", id)
	}
	i, ok := driver.(hal.DigitalInputDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an input driver", driver.Metadata().Name)
	}
	return i, nil
}

func (d *Drivers) DigitalOutputDriver(id string) (hal.DigitalOutputDriver, error) {
	driver, ok := d.drivers[id]
	if !ok {
		return nil, fmt.Errorf("driver by id %s not available", id)
	}
	o, ok := driver.(hal.DigitalOutputDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an Output driver", driver.Metadata().Name)
	}
	return o, nil
}

func (d *Drivers) PWMDriver(id string) (hal.PWMDriver, error) {
	driver, ok := d.drivers[id]
	if !ok {
		return nil, fmt.Errorf("driver by id %s not available", id)
	}
	p, ok := driver.(hal.PWMDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an PWM driver", driver.Metadata().Name)
	}
	return p, nil
}

func (d *Drivers) AnalogInputDriver(id string) (hal.AnalogInputDriver, error) {
	driver, ok := d.drivers[id]
	if !ok {
		return nil, fmt.Errorf("driver by id %s not available", id)
	}
	p, ok := driver.(hal.AnalogInputDriver)
	if !ok {
		return nil, fmt.Errorf("driver %s is not an ADC driver", driver.Metadata().Name)
	}
	return p, nil
}

func parseParams(data json.RawMessage) map[string]interface{} {
	var objmap map[string]interface{}
	json.Unmarshal(data, &objmap)
	params := make(map[string]interface{})
	for k, v := range objmap {
		if val, ok := hal.ConvertToInt(v); ok {
			params[strings.Title(k)] = val
		} else {
			params[strings.Title(k)] = v
		}
	}

	return params
}

func (d *Drivers) Create(d1 Driver) error {
	fn := func(id string) interface{} {
		d1.ID = id
		return &d1
	}
	factory, err := AbstractFactory(d1.Type)
	if err != nil {
		return err
	}

	if d1.Parameters == nil {
		d1.Parameters = parseParams(d1.Config)
	}
	factory.ValidateParameters(d1.Parameters)

	if err := d.store.Create(DriverBucket, fn); err != nil {
		return err
	}

	if err := d.register(d1, factory); err != nil {
		// Registration has failed, we need to de-allocate the DB entry
		_ = d.store.Delete(DriverBucket, d1.ID)
		return err
	}
	return nil
}

func (d *Drivers) Update(id string, d1 Driver) error {
	if id == _rpi {
		return fmt.Errorf("rpi driver is readonly")
	}

	d1.ID = id
	return d.store.Update(DriverBucket, id, d1)
}

func (d *Drivers) Delete(id string) error {
	if id == _rpi {
		return fmt.Errorf("rpi driver is readonly")
	}
	driver, ok := d.drivers[id]
	if ok {
		driver.Close()
	}
	return d.store.Delete(DriverBucket, id)
}

func (d *Drivers) List() ([]Driver, error) {
	ds := []Driver{}
	fn := func(_ string, v []byte) error {
		var d1 Driver
		if err := json.Unmarshal(v, &d1); err != nil {
			return err
		}
		dr, ok := d.drivers[d1.ID]
		if ok {
			d1.loadPinMap(dr)
		}
		ds = append(ds, d1)
		return nil
	}
	return ds, d.store.List(DriverBucket, fn)
}

func (d *Drivers) ListOptions() (map[string][]hal.ConfigParameter, error) {
	options := make(map[string][]hal.ConfigParameter)

	for k, v := range driversMap {
		if k != "rpi" {
			options[k] = v.GetParameters()
		}
	}
	return options, nil
}

func (d *Drivers) ValidateParameters(d1 Driver) (map[string][]string, error) {
	factory, err := AbstractFactory(d1.Type)
	if err != nil {
		return nil, err
	}
	if d1.Parameters == nil {
		d1.Parameters = parseParams(d1.Config)
	}

	_, failures := factory.ValidateParameters(d1.Parameters)
	return failures, nil
}

func (d *Drivers) Close() error {
	for _, d1 := range d.drivers {
		if err := d1.Close(); err != nil {
			log.Println(err)
		}
	}
	return nil
}
