package connectors

import (
	"encoding/json"
	"fmt"

	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const JackBucket = storage.JackBucket

type Jack struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Pins   []int  `json:"pins"`
	Driver string `json:"driver"` // can be either hal or pca9685
}

type Jacks struct {
	store   storage.Store
	drivers *drivers.Drivers
}

func (j Jack) pwmChannel(channel int, drvrs *drivers.Drivers) (hal.PWMChannel, error) {
	d, err := drvrs.PWMDriver(j.Driver)
	if err != nil {
		return nil, fmt.Errorf("driver %s for jack %s not found: %v", j.Driver, j.Name, err)
	}
	return d.PWMChannel(channel)
}

func (j Jack) IsValid(drvrs *drivers.Drivers) error {
	if j.Name == "" {
		return fmt.Errorf("Jack name can not be empty")
	}
	if len(j.Pins) == 0 {
		return fmt.Errorf("Jack should have pins associated with it")
	}
	for _, pin := range j.Pins {
		_, err := j.pwmChannel(pin, drvrs)
		if err != nil {
			return fmt.Errorf("invalid pin %d: %v", pin, err)
		}
	}
	return nil
}

func NewJacks(drivers *drivers.Drivers, store storage.Store) *Jacks {
	return &Jacks{
		store:   store,
		drivers: drivers,
	}
}

func (c *Jacks) Setup() error {
	if err := c.store.CreateBucket(JackBucket); err != nil {
		return err
	}

	return nil
}

func (c *Jacks) Get(id string) (Jack, error) {
	var j Jack
	return j, c.store.Get(JackBucket, id, &j)
}

func (c *Jacks) List() ([]Jack, error) {
	jacks := []Jack{}
	fn := func(v []byte) error {
		var j Jack
		if err := json.Unmarshal(v, &j); err != nil {
			return err
		}
		jacks = append(jacks, j)
		return nil
	}
	return jacks, c.store.List(JackBucket, fn)
}

func (c *Jacks) Create(j Jack) error {
	if err := j.IsValid(c.drivers); err != nil {
		return err
	}

	fn := func(id string) interface{} {
		j.ID = id
		return &j
	}
	if err := c.store.Create(JackBucket, fn); err != nil {
		return err
	}
	return nil
}

func (c *Jacks) Update(id string, j Jack) error {
	if err := j.IsValid(c.drivers); err != nil {
		return err
	}
	j.ID = id
	if err := c.store.Update(JackBucket, id, j); err != nil {
		return err
	}
	return nil
}

func (c *Jacks) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	return c.store.Delete(JackBucket, id)
}

func (c *Jacks) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/jacks", c.list).Methods("GET")
	r.HandleFunc("/api/jacks/{id}", c.get).Methods("GET")
	r.HandleFunc("/api/jacks", c.create).Methods("PUT")
	r.HandleFunc("/api/jacks/{id}", c.update).Methods("POST")
	r.HandleFunc("/api/jacks/{id}", c.delete).Methods("DELETE")
	r.HandleFunc("/api/jacks/{id}/control", c.control).Methods("POST")
}

type PinValues map[int]float64

func (jacks *Jacks) Control(id string, values PinValues) error {
	j, err := jacks.Get(id)
	if err != nil {
		return err
	}
	for _, pin := range j.Pins {
		channel, err := j.pwmChannel(pin, jacks.drivers)
		if err != nil {
			return fmt.Errorf("pin %d on jack %s has no driver: %v", pin, id, err)
		}
		v, ok := values[pin]
		if ok {
			if err := channel.Set(v); err != nil {
				return err
			}
		}
	}
	return nil
}

func (c *Jacks) control(w http.ResponseWriter, r *http.Request) {
	var v PinValues
	fn := func(id string) error {
		return c.Control(id, v)
	}
	utils.JSONUpdateResponse(&v, fn, w, r)
}

func (c *Jacks) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Jacks) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Jacks) create(w http.ResponseWriter, r *http.Request) {
	var j Jack
	fn := func() error {
		return c.Create(j)
	}
	utils.JSONCreateResponse(&j, fn, w, r)
}

func (c *Jacks) update(w http.ResponseWriter, r *http.Request) {
	var j Jack
	fn := func(id string) error {
		return c.Update(id, j)
	}
	utils.JSONUpdateResponse(&j, fn, w, r)
}

func (c *Jacks) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
