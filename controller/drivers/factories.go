package drivers

import (
	"fmt"
	"github.com/kidoman/embd"
	pcahal "github.com/reef-pi/drivers/hal/pca9685"
	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/settings"
	rpihal "github.com/reef-pi/rpi/hal"
	"github.com/reef-pi/rpi/i2c"
	"github.com/reef-pi/rpi/pwm"
	"log"
)

type Factory func(settings settings.Settings, bus i2c.Bus) (hal.Driver, error)

func pca9685Factory(s settings.Settings, bus i2c.Bus) (i hal.Driver, e error) {
	config := pcahal.DefaultPCA9685Config
	config.Address = s.PCA9685_Address
	config.Frequency = s.PCA9685_PWMFreq
	return pcahal.New(config, bus)
}

func rpiNoopFactory(s settings.Settings, _ i2c.Bus) (hal.Driver, error) {
	pd, _ := pwm.Noop()
	return rpihal.NewAdapter(rpihal.Settings{PWMFreq: s.RPI_PWMFreq}, pd, rpihal.NoopPinFactory)
}

func rpiFactory(s settings.Settings, _ i2c.Bus) (hal.Driver, error) {
	pinFactory := func(k interface{}) (rpihal.DigitalPin, error) {
		return embd.NewDigitalPin(k)
	}
	return rpihal.NewAdapter(rpihal.Settings{PWMFreq: s.RPI_PWMFreq}, pwm.New(), pinFactory)
}

func (d *Drivers) loadDrivers(s settings.Settings, bus i2c.Bus) error {
	if s.Capabilities.DevMode {
		if err := d.register(s, bus, rpiNoopFactory); err != nil {
			return err
		}
	} else {
		if err := d.register(s, bus, rpiFactory); err != nil {
			return err
		}
	}
	if err := d.register(s, bus, pca9685Factory); err != nil {
		return err
	}

	configs, err := d.List()
	if err != nil {
		return err
	}
	for _, config := range configs {
		var factory Factory
		switch config.Type {
		case "pca9685":
			factory = pca9685Factory
			break
		default:
			return fmt.Errorf("Unknown driver type: %s for driver %s", config.Type, config.Name)
			break
		}

		if err := d.register(s, bus, factory); err != nil {
			log.Println("ERROR: Failed to initialize driver:", config.Name, "Error:", err)
		}
	}
	return nil
}
