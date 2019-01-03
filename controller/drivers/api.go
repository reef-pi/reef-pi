package drivers

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (d *Drivers) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/drivers", d.list).Methods("GET")
	r.HandleFunc("/api/drivers/{id}", d.get).Methods("GET")
	r.HandleFunc("/api/drivers", d.create).Methods("PUT")
	r.HandleFunc("/api/drivers/{id}", d.delete).Methods("DELETE")
	r.HandleFunc("/api/drivers/{id}", d.update).Methods("POST")
}

func (d *Drivers) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return d.List()
	}
	utils.JSONListResponse(fn, w, r)
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
