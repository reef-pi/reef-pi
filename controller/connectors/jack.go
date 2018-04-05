package connectors

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (j Jack) IsValid() error {
	if j.Name == "" {
		return fmt.Errorf("Jack name can not be empty")
	}
	if len(j.Pins) == 0 {
		return fmt.Errorf("Jack should have pins associated with it")
	}
	switch j.Driver {
	case "pca9685":
		for _, pin := range j.Pins {
			if (pin > 14) || (pin < 0) {
				return fmt.Errorf("Invalid pin:%d", pin)
			}
		}
	case "rpi":
		for _, pin := range j.Pins {
			if (pin > 1) || (pin < 0) {
				return fmt.Errorf("Invalid pin:%d", pin)
			}
		}
	default:
		return fmt.Errorf("Driver type can not be anything else other than rpi or pca9685")
	}
	return nil
}

const JackBucket = "jacks"

type Jack struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Pins   []int  `json:"pins"`
	Driver string `json:"driver"` // can be either rpi or pca9685
}

type Jacks struct {
	store   utils.Store
	rpi     utils.PWM
	pca9685 utils.PWM
}

func NewJacks(store utils.Store, r, p utils.PWM) *Jacks {
	return &Jacks{
		store:   store,
		rpi:     r,
		pca9685: p,
	}
}

func (c *Jacks) Setup() error {
	return c.store.CreateBucket(JackBucket)
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
	if err := j.IsValid(); err != nil {
		return err
	}

	fn := func(id string) interface{} {
		j.ID = id
		return &j
	}
	return c.store.Create(JackBucket, fn)
}

func (c *Jacks) Update(id string, j Jack) error {
	if err := j.IsValid(); err != nil {
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

type PinValues map[int]int

func (jacks *Jacks) DirectControl(driver string, pin, v int) error {
	switch driver {
	case "rpi":
		if err := jacks.rpi.On(pin); err != nil {
			return err
		}
		return jacks.rpi.Set(pin, v)
	case "pca9685":
		return jacks.pca9685.Set(pin, v)
	default:
		return fmt.Errorf("Invalid jack driver:%s", driver)
	}
}

func (jacks *Jacks) Control(id string, values PinValues) error {
	j, err := jacks.Get(id)
	if err != nil {
		return err
	}
	for _, pin := range j.Pins {
		v, ok := values[pin]
		if ok {
			if err := jacks.DirectControl(j.Driver, pin, v); err != nil {
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
