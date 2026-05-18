package drivers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (d *Drivers) LoadAPI(r chi.Router) {
	r.Get("/api/drivers", d.list)
	r.Get("/api/drivers/options", d.listOptions)
	r.Get("/api/drivers/{id}", d.get)
	r.Put("/api/drivers", d.create)
	r.Delete("/api/drivers/{id}", d.delete)
	r.Post("/api/drivers/{id}", d.update)
	r.Post("/api/drivers/validate", d.validate)
}

func (d *Drivers) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		ds, err := d.List()
		if err == nil {
			dr, ok := d.drivers[_rpi]
			if ok {
				piDriver.loadPinMap(dr)
				ds = append(ds, piDriver)
			}
		}
		return ds, err
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) listOptions(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		ds, err := d.ListOptions()
		return ds, err
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) validate(w http.ResponseWriter, r *http.Request) {
	var d1 Driver

	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(&d1); err != nil {
		utils.ErrorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}

	var failures = make(map[string]string)
	drivers, err := d.List()
	for _, driver := range drivers {
		if driver.Name == d1.Name && driver.ID != d1.ID {
			failures["name"] = "The name " + d1.Name + " is already in use"
		}
	}

	errs, err := d.ValidateParameters(d1)
	if err != nil {
		utils.ErrorResponse(http.StatusBadRequest, err.Error(), w)
	}
	for k, v := range errs {
		failures["config."+strings.ToLower(k)] = strings.Join(v, "\n")
	}
	if len(failures) > 0 {
		utils.JSONResponseWithStatus(http.StatusBadRequest, failures, w, r)
	} else {
		utils.JSONResponseWithStatus(http.StatusOK, nil, w, r)
	}
}

func (d *Drivers) get(w http.ResponseWriter, r *http.Request) {

	fn := func(id string) (interface{}, error) {
		return d.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (d *Drivers) update(w http.ResponseWriter, r *http.Request) {
	var d1 Driver
	fn := func(id string) error {
		return d.Update(id, d1)
	}
	utils.JSONUpdateResponse(&d1, fn, w, r)
}

func (d *Drivers) create(w http.ResponseWriter, r *http.Request) {
	var d1 Driver
	fn := func() error {
		return d.Create(d1)
	}
	utils.JSONCreateResponse(&d1, fn, w, r)
}

func (d *Drivers) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return d.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
