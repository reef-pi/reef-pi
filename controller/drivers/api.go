package drivers

import (
	"net/http"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func (d *Drivers) LoadAPI(r *controller.DocRouter) {
	r.HandleFunc("/api/drivers", d.list).Methods("GET")
	r.HandleFunc("/api/drivers/{id}", d.get).Methods("GET")
	r.HandleFunc("/api/drivers", d.create).Methods("PUT")
	r.HandleFunc("/api/drivers/{id}", d.delete).Methods("DELETE")
	r.HandleFunc("/api/drivers/{id}", d.update).Methods("POST")
}

func (d *Drivers) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		ds, err := d.List()
		if err == nil {
			ds = append(ds, piDriver)
		}
		return ds, err
	}
	utils.JSONListResponse(fn, w, r)
}

func (d *Drivers) get(w http.ResponseWriter, r *http.Request) {

	var dr Driver
	fn := func(id string) (interface{}, error) {
		if err := d.store.Get(DriverBucket, id, &dr); err != nil {
			return nil, err
		}
		return dr, nil
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
