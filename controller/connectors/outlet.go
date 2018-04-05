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

var (
	ValidGPIOPins = map[int]bool{
		2:  true,
		3:  true,
		4:  true,
		5:  true,
		6:  true,
		7:  true,
		8:  true,
		9:  true,
		10: true,
		11: true,
		12: true,
		13: true,
		14: true,
		15: true,
		16: true,
		17: true,
		18: true,
		19: true,
		20: true,
		21: true,
		22: true,
		23: true,
		24: true,
		25: true,
		26: true,
		27: true,
	}
)

type Outlet struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Pin       int    `json:"pin"`
	Equipment string `json:"equipment"`
	Reverse   bool   `json:"reverse"`
}

func (o Outlet) IsValid() error {
	if o.Name == "" {
		return fmt.Errorf("Outlet name can not be empty")
	}
	_, ok := ValidGPIOPins[o.Pin]
	if !ok {
		return fmt.Errorf("GPIO Pin %d is not valid", o.Pin)
	}
	return nil
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
	if err := o.IsValid(); err != nil {
		return err
	}
	fn := func(id string) interface{} {
		o.ID = id
		return &o
	}
	return c.store.Create(OutletBucket, fn)
}

func (c *Outlets) Update(id string, o Outlet) error {
	o.ID = id
	if err := o.IsValid(); err != nil {
		return err
	}
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
