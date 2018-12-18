package drivers

import (
	"errors"
	"fmt"
	"github.com/kidoman/embd"
	"net/http"
	"sort"
	"sync"

	pcahal "github.com/reef-pi/drivers/hal/pca9685"
	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/drivers/mockpca9685"
	"github.com/reef-pi/reef-pi/controller/drivers/mockrpi"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
	rpihal "github.com/reef-pi/rpi/hal"
	"github.com/reef-pi/rpi/pwm"

	"github.com/gorilla/mux"

	"github.com/reef-pi/rpi/i2c"
)

// TODO(theatrus): special casing i2c feels weird here
type Factory func(settings settings.Settings, bus i2c.Bus) (hal.Driver, error)

type Drivers struct {
	sync.Mutex
	drivers map[string]hal.Driver
}

func NewDrivers(s settings.Settings, bus i2c.Bus, store storage.Store) (*Drivers, error) {
	d := &Drivers{
		drivers: make(map[string]hal.Driver),
	}
	if s.Capabilities.DevMode {
		if err := d.register(s, bus, mockrpi.NewMockDriver); err != nil {
			return nil, err
		}
		if err := d.register(s, bus, mockpca9685.NewMockDriver); err != nil {
			return nil, err
		}
		return d, nil
	}

	rpiFactory := func(s settings.Settings, bus i2c.Bus) (hal.Driver, error) {
		return rpihal.New(rpihal.Settings{PWMFreq: s.RPI_PWMFreq}, pwm.New(), embd.NewDigitalPin)
	}

	if err := d.register(s, bus, rpiFactory); err != nil {
		return nil, err
	}
	if s.PCA9685 {
		factory := func(settings settings.Settings, bus i2c.Bus) (i hal.Driver, e error) {
			config := pcahal.DefaultPCA9685Config
			config.Address = s.PCA9685_Address
			config.Frequency = s.PCA9685_PWMFreq
			return pcahal.New(config, bus)
		}
		if err := d.register(s, bus, factory); err != nil {
			return nil, err
		}
	}
	return d, nil
}

func (d *Drivers) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/drivers", d.list).Methods("GET")
}

func (d *Drivers) List() ([]hal.Metadata, error) {
	var drivers []hal.Metadata
	for _, v := range d.drivers {
		drivers = append(drivers, v.Metadata())
	}
	sort.Slice(drivers, func(i, j int) bool { return drivers[i].Name < drivers[j].Name })
	return drivers, nil
}

func (d *Drivers) Get(name string) (hal.Driver, error) {
	driver, ok := d.drivers[name]
	if !ok {
		return nil, fmt.Errorf("driver by name %s not available", name)
	}
	return driver, nil
}

func (d *Drivers) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return d.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) register(s settings.Settings, b i2c.Bus, f Factory) error {
	r, err := f(s, b)
	if err != nil {
		return err
	}
	meta := r.Metadata()
	if meta.Name == "" {
		return errors.New("driver did not report a name")
	}
	if _, ok := d.drivers[meta.Name]; ok {
		return fmt.Errorf("driver name already taken: %s", meta.Name)
	}
	d.Lock()
	d.drivers[meta.Name] = r
	d.Unlock()
	return nil
}
