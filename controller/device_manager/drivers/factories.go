package drivers

import (
	"fmt"
	"log"

	"github.com/reef-pi/drivers/tasmota"

	"github.com/reef-pi/drivers/ads1x15"
	"github.com/reef-pi/drivers/dli"
	"github.com/reef-pi/drivers/esp32"
	"github.com/reef-pi/drivers/ezo"
	"github.com/reef-pi/drivers/file"
	"github.com/reef-pi/drivers/pca9685"
	"github.com/reef-pi/drivers/ph_board"
	"github.com/reef-pi/drivers/pico_board"
	"github.com/reef-pi/drivers/shelly"
	"github.com/reef-pi/drivers/sht3x"
	"github.com/reef-pi/drivers/tplink"
	"github.com/reef-pi/hal"
	rpihal "github.com/reef-pi/rpi/hal"
)

var driversMap = map[string]hal.DriverFactory{
	"ads1015":      ads1x15.Ads1015Factory(),
	"ads1115":      ads1x15.Ads1115Factory(),
	"dli-wpsp":     dli.Adapter(),
	"esp32":        esp32.Factory(),
	"file-analog":  file.AnalogFactory(),
	"file-digital": file.DigitalFactory(),
	"hs103":        tplink.HS103Factory(),
	"hs110":        tplink.HS110Factory(),
	"hs300":        tplink.HS300Factory(),
	"hs303":        tplink.HS303Factory(),
	"pca9685":      pca9685.Factory(),
	"ph-board":     ph_board.Factory(),
	"ph-ezo":       ezo.Factory(),
	"pico-board":   pico_board.Factory(),
	"rpi":          rpihal.RpiFactory(),
	"shelly1":      shelly.Shelly1Adapter(false),
	"shelly2.5":    shelly.Shelly25Adapter(false),
	"sht31d":       sht3x.Factory(),
	"tasmota-http": tasmota.HttpDriverFactory(),
}

func AbstractFactory(t string) (hal.DriverFactory, error) {
	f, ok := driversMap[t]
	if !ok {
		return nil, fmt.Errorf("Unknown driver type:%s", t)
	}
	return f, nil
}

var piDriver = Driver{
	Name:   "Raspberry Pi",
	ID:     _rpi,
	Type:   _rpi,
	Config: []byte(`{"frequency": 150, "Dev Mode": true}`),
}

func (d *Drivers) loadRpi() error {
	factory, err := AbstractFactory(_rpi)
	if err != nil {
		return err
	}
	piDriver.Parameters = parseParams(piDriver.Config)
	if d.pwm_freq > 0 {
		piDriver.Parameters["Frequency"] = d.pwm_freq
	}
	return d.register(piDriver, factory)
}

func (d *Drivers) loadAll() error {
	if d.isRaspberryPi {
		if err := d.loadRpi(); err != nil {
			d.t.LogError("driver-subsystem", "Failed load raspberry pi driver. Error:"+err.Error())
			log.Println("driver-subsystem: Failed load raspberry pi driver. Error:", err.Error())
		}
	}

	ds, err := d.List()
	if err != nil {
		log.Println("driver-subsystem: Failed load raspberry pi driver. Error:", err.Error())
		return err
	}

	for _, d1 := range ds {
		f, err := AbstractFactory(d1.Type)
		if err != nil {
			log.Println("ERROR: Failed to detect loader for driver type: ", d1.Type, " Error: ", err)
			d.t.LogError("driver-subsystem", "failed to detect loader for: "+d1.Type+" Error: "+err.Error())
			continue
		}
		if err := d.register(d1, f); err != nil {
			log.Println("ERROR: Failed to initialize driver: ", d1.Name, " Error:", err)
			d.t.LogError("driver-subsystem", "failed to initialize driver: "+d1.Name+" Error: "+err.Error())
		}
	}
	return nil
}

func (d *Drivers) register(d1 Driver, f hal.DriverFactory) error {
	d.Lock()
	defer d.Unlock()

	if d1.Parameters == nil {
		d1.Parameters = parseParams(d1.Config)
	}

	r, err := f.NewDriver(d1.Parameters, d.bus)
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
