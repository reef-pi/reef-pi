package connectors

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
)

const OutletBucket = "outlets"

type Outlet struct {
	ID        string `json:"id" yaml:"id"`
	Name      string `json:"name" yaml:"name"`
	Pin       int    `json:"pin" yaml:"pin"`
	Equipment string `json:"equipment" yaml:"equipment"`
	Reverse   bool   `json:"reverse" yaml:"reverse"`
}

type Outlets struct {
	store   utils.Store
	DevMode bool
}

func NewOutlets(store utils.Store) *Outlets {
	return &Outlets{store: store}
}

func (c *Outlets) Setup() error {
	return c.store.CreateBucket(OutletBucket)
}

func (c *Outlets) Configure(id string, on bool) error {
	o, err := c.Get(id)
	if err != nil {
		return fmt.Errorf("Outlet name: '%s' does noy exist", err)
	}
	if c.DevMode {
		log.Println("Dev mode on. Skipping:", o.Name, "On:", on)
		return nil
	}
	if o.Reverse {
		on = !on
	}
	if on {
		return utils.SwitchOn(o.Pin)
	}
	return utils.SwitchOff(o.Pin)
}

func (c *Outlets) Create(o Outlet) error {
	if o.Name == "" {
		return fmt.Errorf("Outlet name can not be empty")
	}
	if o.Pin == 0 {
		return fmt.Errorf("Set outlet pin")
	}
	fn := func(id string) interface{} {
		o.ID = id
		return &o
	}
	return c.store.Create(OutletBucket, fn)
}

func (c *Outlets) Update(id string, o Outlet) error {
	o.ID = id
	return c.store.Update(OutletBucket, id, o)
}

func (c *Outlets) List() ([]Outlet, error) {
	outlets := []Outlet{}
	fn := func(v []byte) error {
		var o Outlet
		if err := json.Unmarshal(v, &o); err != nil {
			return err
		}
		outlets = append(outlets, o)
		return nil
	}
	return outlets, c.store.List(OutletBucket, fn)
}

func (c *Outlets) Delete(id string) error {
	o, err := c.Get(id)
	if err != nil {
		return err
	}
	if o.Equipment != "" {
		return fmt.Errorf("Outlet: %s has equipment: %s attached to it.", o.Name, o.Equipment)
	}
	return c.store.Delete(OutletBucket, id)
}

func (c *Outlets) Get(id string) (Outlet, error) {
	var o Outlet
	return o, c.store.Get(OutletBucket, id, &o)
}

func (e *Outlets) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/outlets/{id}", e.get).Methods("GET")
	r.HandleFunc("/api/outlets", e.list).Methods("GET")
	r.HandleFunc("/api/outlets", e.create).Methods("PUT")
	r.HandleFunc("/api/outlets/{id}", e.delete).Methods("DELETE")
	r.HandleFunc("/api/outlets/{id}", e.update).Methods("POST")
}
func (c *Outlets) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Outlets) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Outlets) update(w http.ResponseWriter, r *http.Request) {
	var o Outlet
	fn := func(id string) error {
		return c.Update(id, o)
	}
	utils.JSONUpdateResponse(&o, fn, w, r)
}

func (c *Outlets) create(w http.ResponseWriter, r *http.Request) {
	var o Outlet
	fn := func() error {
		return c.Create(o)
	}
	utils.JSONCreateResponse(&o, fn, w, r)
}

func (c *Outlets) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
