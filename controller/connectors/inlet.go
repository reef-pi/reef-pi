package connectors

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"math/rand"
	"net/http"
)

const InletBucket = "inlets"

type Inlet struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Pin       int    `json:"pin"`
	Equipment string `json:"equipment"`
	Reverse   bool   `json:"reverse"`
}
type Inlets struct {
	store   utils.Store
	DevMode bool
}

func (e *Inlets) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/inlets/{id}", e.get).Methods("GET")
	r.HandleFunc("/api/inlets", e.list).Methods("GET")
	r.HandleFunc("/api/inlets", e.create).Methods("PUT")
	r.HandleFunc("/api/inlets/{id}", e.delete).Methods("DELETE")
	r.HandleFunc("/api/inlets/{id}", e.update).Methods("POST")
	r.HandleFunc("/api/inlets/{id}/read", e.read).Methods("POST")
}

func (i Inlet) IsValid() error {
	if i.Name == "" {
		return fmt.Errorf("Inlet name can not be empty")
	}
	_, ok := ValidGPIOPins[i.Pin]
	if !ok {
		return fmt.Errorf("GPIO Pin %d is not valid", i.Pin)
	}
	return nil
}

func NewInlets(store utils.Store) *Inlets {
	return &Inlets{store: store}
}

func (c *Inlets) Setup() error {
	return c.store.CreateBucket(InletBucket)
}

func (c *Inlets) Read(id string) (int, error) {
	i, err := c.Get(id)
	if err != nil {
		return -1, fmt.Errorf("Inleet name: '%s' does noy exist", err)
	}
	if c.DevMode {
		log.Println("Dev mode on. Skipping:", i.Name)
		return rand.Int() % 2, nil
	}
	v, err := utils.ReadGPIO(i.Pin)
	if !i.Reverse {
		return v, err
	}
	if v == 1 {
		return 0, err
	} else {
		return 1, err
	}
}

func (c *Inlets) Create(i Inlet) error {
	if err := i.IsValid(); err != nil {
		return err
	}
	fn := func(id string) interface{} {
		i.ID = id
		return &i
	}
	return c.store.Create(InletBucket, fn)
}

func (c *Inlets) Update(id string, i Inlet) error {
	i.ID = id
	if err := i.IsValid(); err != nil {
		return err
	}
	return c.store.Update(InletBucket, id, i)
}

func (c *Inlets) List() ([]Inlet, error) {
	inlets := []Inlet{}
	fn := func(v []byte) error {
		var i Inlet
		if err := json.Unmarshal(v, &i); err != nil {
			return err
		}
		inlets = append(inlets, i)
		return nil
	}
	return inlets, c.store.List(InletBucket, fn)
}

func (c *Inlets) Delete(id string) error {
	i, err := c.Get(id)
	if err != nil {
		return err
	}
	if i.Equipment != "" {
		return fmt.Errorf("Inlet: %s has equipment: %s attached to it.", i.Name, i.Equipment)
	}
	return c.store.Delete(InletBucket, id)
}

func (c *Inlets) Get(id string) (Inlet, error) {
	var i Inlet
	return i, c.store.Get(InletBucket, id, &i)
}

func (c *Inlets) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Inlets) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Inlets) update(w http.ResponseWriter, r *http.Request) {
	var i Inlet
	fn := func(id string) error {
		return c.Update(id, i)
	}
	utils.JSONUpdateResponse(&i, fn, w, r)
}
func (c *Inlets) read(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Read(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Inlets) create(w http.ResponseWriter, r *http.Request) {
	var i Inlet
	fn := func() error {
		return c.Create(i)
	}
	utils.JSONCreateResponse(&i, fn, w, r)
}

func (c *Inlets) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
