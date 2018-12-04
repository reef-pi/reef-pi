package drivers

import (
	"errors"
	"fmt"
	"net/http"
	"sort"

	"github.com/reef-pi/reef-pi/controller/drivers/mockpca9685"
	"github.com/reef-pi/reef-pi/controller/drivers/mockrpi"
	"github.com/reef-pi/reef-pi/controller/drivers/pca9685"
	"github.com/reef-pi/reef-pi/controller/drivers/rpi"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/types/driver"
	"github.com/reef-pi/reef-pi/controller/utils"

	"github.com/gorilla/mux"
	"github.com/reef-pi/rpi/i2c"
)

// TODO(theatrus): special casing i2c feels weird here
type driverBuilder func(settings settings.Settings, bus i2c.Bus) (driver.Driver, error)

type Drivers struct {
	drivers map[string]driver.Driver
}

func NewDrivers(s settings.Settings, bus i2c.Bus, store types.Store) (*Drivers, error) {
	d := &Drivers{
		drivers: make(map[string]driver.Driver),
	}
	var driverList []driverBuilder
	if s.Capabilities.DevMode {
		driverList = []driverBuilder{
			mockrpi.NewMockDriver,
			mockpca9685.NewMockDriver,
		}
	} else {
		driverList = []driverBuilder{
			rpi.NewRPiDriver,
			pca9685.NewPCA9685,
		}
	}
	for _, entry := range driverList {
		err := d.register(s, bus, entry)
		if err != nil {
			return nil, err
		}
	}
	return d, nil
}

func (d *Drivers) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/drivers", d.list).Methods("GET")
}

func (d *Drivers) List() ([]driver.Metadata, error) {
	var drivers []driver.Metadata
	for _, v := range d.drivers {
		drivers = append(drivers, v.Metadata())
	}
	sort.Slice(drivers, func(i, j int) bool { return drivers[i].Name < drivers[j].Name })
	return drivers, nil
}

func (d *Drivers) Get(name string) (driver.Driver, error) {
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

func (d *Drivers) register(s settings.Settings, b i2c.Bus, f driverBuilder) error {
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
	d.drivers[meta.Name] = r
	return nil
}
