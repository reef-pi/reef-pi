package drivers

import (
	"errors"
	"fmt"
	"net/http"
	"sort"
	"sync"

	"github.com/kidoman/embd"

	pcahal "github.com/reef-pi/drivers/hal/pca9685"
	"github.com/reef-pi/hal"
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

// Names is a return type for API access to return known names for a given capability
type Names struct {
	Driver     string   `json:"driver"`
	Capability string   `json:"capability"`
	Names      []string `json:"names"`
}

type Drivers struct {
	sync.Mutex
	drivers map[string]hal.Driver
}

func NewDrivers(s settings.Settings, bus i2c.Bus, store storage.Store) (*Drivers, error) {
	d := &Drivers{
		drivers: make(map[string]hal.Driver),
	}
	factory := func(settings settings.Settings, bus i2c.Bus) (i hal.Driver, e error) {
		config := pcahal.DefaultPCA9685Config
		config.Address = s.PCA9685_Address
		config.Frequency = s.PCA9685_PWMFreq
		return pcahal.New(config, bus)
	}
	if err := d.register(s, bus, factory); err != nil {
		return nil, err
	}
	if s.Capabilities.DevMode {
		rpiFactory := func(s settings.Settings, _ i2c.Bus) (hal.Driver, error) {
			pd, _ := pwm.Noop()
			return rpihal.NewAdapter(rpihal.Settings{PWMFreq: s.RPI_PWMFreq}, pd, rpihal.NoopPinFactory)
		}
		if err := d.register(s, bus, rpiFactory); err != nil {
			return nil, err
		}
		return d, nil
	}

	rpiFactory := func(s settings.Settings, _ i2c.Bus) (hal.Driver, error) {
		pinFactory := func(k interface{}) (rpihal.DigitalPin, error) {
			return embd.NewDigitalPin(k)
		}
		return rpihal.NewAdapter(rpihal.Settings{PWMFreq: s.RPI_PWMFreq}, pwm.New(), pinFactory)
	}

	if err := d.register(s, bus, rpiFactory); err != nil {
		return nil, err
	}
	return d, nil
}

func (d *Drivers) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/drivers", d.list).Methods("GET")
	r.HandleFunc("/api/drivers/{id}/inputs", d.listDriverInputs).Methods("GET")
}

func (d *Drivers) ListByCapabilities(capabilities []hal.Capability) ([]hal.Metadata, error) {
	var drivers []hal.Metadata
	drivers: for _, v := range d.drivers {
		for _, cap := range capabilities {
			if !v.Metadata().HasCapability(cap) {
				continue drivers
			}
		}
		drivers = append(drivers, v.Metadata())
	}
	sort.Slice(drivers, func(i, j int) bool { return drivers[i].Name < drivers[j].Name })
	return drivers, nil
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
		query := r.URL.Query()
		if textCapabilities, ok := query["capability"]; ok {
			capabilities := []hal.Capability{}
			for _, textCapability := range textCapabilities {
				switch textCapability {
				case "input":
					capabilities = append(capabilities, hal.Input)
				case "output":
					capabilities = append(capabilities, hal.Output)
				case "pwm":
					capabilities = append(capabilities, hal.PWM)
				case "ph":
					capabilities = append(capabilities, hal.PH)
				case "temperature":
					capabilities = append(capabilities, hal.Temperature)
				}
			}
			return d.ListByCapabilities(capabilities)
		}
		return d.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) listDriverInputs(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		driver, err := d.Get(id)
		if err != nil {
			return nil, err
		}
		inputDriver, ok := driver.(hal.InputDriver)
		if !ok {
			return nil, fmt.Errorf("driver %s is not an input driver", id)
		}
		names := Names{
			Driver:     id,
			Capability: "input",
		}
		for _, pin := range inputDriver.InputPins() {
			names.Names = append(names.Names, pin.Name())
		}

		return &names, nil
	}
	utils.JSONGetResponse(fn, w, r)
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
