package connectors

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/pkg/errors"
	"github.com/reef-pi/reef-pi/controller/drivers"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/types/driver"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const JackBucket = types.JackBucket

type Jack struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Pins   []int  `json:"pins"`
	Driver string `json:"driver"` // can be either rpi or pca9685
}

type Jacks struct {
	store   types.Store
	drivers *drivers.Drivers
	rpi     types.PWM
	pca9685 types.PWM
}

func (j Jack) pwmChannel(channel int, drvrs *drivers.Drivers) (driver.PWMChannel, error) {
	drvr, err := drvrs.Get(j.Driver)
	if err != nil {
		return nil, errors.Wrapf(err, "driver %s for jack %s not found", j.Driver, j.ID)
	}
	pwmDrvr, ok := drvr.(driver.PWM)
	if !ok {
		return nil, fmt.Errorf("driver %s is not a PWM driver", j.Driver)
	}
	return pwmDrvr.GetPWMChannel(fmt.Sprintf("%d", channel))
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
			return errors.Wrapf(err, "invalid pin %d", pin)
		}
	}
	return nil
}

func NewJacks(drivers *drivers.Drivers, store types.Store, r, p types.PWM) *Jacks {
	return &Jacks{
		store:   store,
		rpi:     r,
		pca9685: p,
		drivers: drivers,
	}
}

func (c *Jacks) Setup() error {
	if err := c.store.CreateBucket(JackBucket); err != nil {
		return err
	}
	jacks, err := c.List()
	if err != nil {
		return err
	}

	for _, j := range jacks {
		if j.Driver == "rpi" {
			for _, p := range j.Pins {
				if err := c.rpi.On(p); err != nil {
					log.Println("ERROR: failed to switch on rpi based jack:", j.Name, "pin:", p, "Error:", err)
				}
			}
		}
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
	if j.Driver == "rpi" {
		for _, p := range j.Pins {
			if err := c.rpi.On(p); err != nil {
				return err
			}
		}
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
	if j.Driver == "rpi" {
		for _, p := range j.Pins {
			if err := c.rpi.On(p); err != nil {
				return err
			}
		}
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

func (jacks *Jacks) DirectControl(driver string, pin int, v float64) error {
	log.Println("Setting pwm driver:", driver, "pin:", pin, "value:", v)
	switch driver {
	case "rpi":
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
