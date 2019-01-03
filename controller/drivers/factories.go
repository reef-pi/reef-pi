package drivers

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/kidoman/embd"

	pcahal "github.com/reef-pi/drivers/hal/pca9685"
	"github.com/reef-pi/hal"
	rpihal "github.com/reef-pi/rpi/hal"
	"github.com/reef-pi/rpi/i2c"
	"github.com/reef-pi/rpi/pwm"
)

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
		return pca9685Factory, nil
	default:
		return nil, fmt.Errorf("Unknown driver type:%s", t)
	}
}

func pca9685Factory(confData []byte, bus i2c.Bus) (hal.Driver, error) {
	config := pcahal.DefaultPCA9685Config
	if err := json.Unmarshal(confData, &config); err != nil {
		return nil, err
	}
	return pcahal.New(config, bus)
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
	if err := d.register([]byte(`{"pwm_freq":150}`), factory); err != nil {
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
		if err := d.register(d1.Config, f); err != nil {
			log.Println("ERROR: Failed to initialize driver:", d1.Name, "Error:", err)
		}
	}
	return nil
}
