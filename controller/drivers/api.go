package drivers

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/drivers/rpi"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
)

type Drivers struct {
	drivers map[string]Driver
}

func NewDrivers(bus i2c.Bus, store types.Store) *Drivers {
	d := &Drivers{
		drivers: make(map[string]Driver),
	}
	d.register(rpi.NewRPiDriver)
	return d
}

func (d *Drivers) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/drivers", d.list).Methods("GET")
}

func (d *Drivers) List() ([]Metadata, error) {
	var drivers []Metadata
	for _, v := range d.drivers {
		drivers = append(drivers, v.Metadata())
	}
	return drivers, nil
}

func (d *Drivers) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return d.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) register(f func() (Driver, error)) error {
	r, err := f()
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
