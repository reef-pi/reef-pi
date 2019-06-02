package drivers

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/kidoman/embd"

	"github.com/reef-pi/drivers"
	"github.com/reef-pi/drivers/pca9685"
	"github.com/reef-pi/drivers/ph_board"
	"github.com/reef-pi/drivers/pico_board"
	"github.com/reef-pi/drivers/tplink"
	"github.com/reef-pi/hal"
	rpihal "github.com/reef-pi/rpi/hal"
	"github.com/reef-pi/rpi/i2c"
	"github.com/reef-pi/rpi/pwm"
)

var piDriver = Driver{
	Name:   "Raspberry Pi",
	ID:     "rpi",
	Type:   "rpi",
	Config: []byte(`{"pwm_freq": 150}`),
}

type Factory func(config []byte, bus i2c.Bus) (hal.Driver, error)

func AbstractFactory(t string, dev_mode bool) (Factory, error) {
	switch t {
	case "rpi":
		if dev_mode {
			return rpiNoopFactory, nil
		} else {
			return rpiFactory, nil
		}
	case "pca9685":
		return pca9685.HALAdapter, nil
	case "ph-board":
		return ph_board.HalAdapter, nil
	case "pico-board":
		return pico_board.HalAdapter, nil
	case "ph-ezo":
		return drivers.EzoHalAdapter, nil
	case "hs1xx":
		return tplink.HALAdapter, nil
	default:
		return nil, fmt.Errorf("Unknown driver type:%s", t)
	}
}

func rpiNoopFactory(_ []byte, _ i2c.Bus) (hal.Driver, error) {
	pd, _ := pwm.Noop()
	return rpihal.NewAdapter(rpihal.Settings{PWMFreq: 150}, pd, rpihal.NoopPinFactory)
}

func rpiFactory(confData []byte, _ i2c.Bus) (hal.Driver, error) {
	pinFactory := func(k interface{}) (rpihal.DigitalPin, error) {
		return embd.NewDigitalPin(k)
	}
	var conf rpihal.Settings
	if err := json.Unmarshal(confData, &conf); err != nil {
		return nil, err
	}
	return rpihal.NewAdapter(conf, pwm.New(), pinFactory)
}

func (d *Drivers) loadAll() error {
	factory, err := AbstractFactory("rpi", d.dev_mode)
	if err != nil {
		return err
	}
	if err := d.register(piDriver, factory); err != nil {
		return err
	}
	ds, err := d.List()
	if err != nil {
		return err
	}
	for _, d1 := range ds {
		f, err := AbstractFactory(d1.Type, d.dev_mode)
		if err != nil {
			log.Println("ERROR: Failed to detect loader for driver type:", d1.Type, "Error:", err)
		}
		if err := d.register(d1, f); err != nil {
			log.Println("ERROR: Failed to initialize driver:", d1.Name, "Error:", err)
		}
	}
	return nil
}

func (d *Drivers) register(d1 Driver, f Factory) error {
	d.Lock()
	defer d.Unlock()
	r, err := f(d1.Config, d.bus)
	if err != nil {
		return err
	}
	meta := r.Metadata()
	if d1.ID == "" {
		return fmt.Errorf("Empty id, Name:%s", meta.Name)
	}
	if alt, ok := d.drivers[d1.ID]; ok {
		return fmt.Errorf("driver id already taken by %s", alt.Metadata().Name)
	}
	log.Println("driver-subsystem: registering driver id:", d1.ID, "Name:", d1.Name)
	d.drivers[d1.ID] = r
	return nil
}
