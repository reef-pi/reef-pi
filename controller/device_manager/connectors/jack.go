package connectors

import (
	"fmt"
	"log"

	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const JackBucket = storage.JackBucket

// swagger:model jack
type Jack struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Pins    []int  `json:"pins"`
	Driver  string `json:"driver"` // can be either hal or pca9685
	Reverse bool   `json:"reverse"`
}

type Jacks struct {
	repo    jackRepository
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
		return fmt.Errorf("Jack name cannot be empty")
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
		repo:    newJackRepository(store),
		drivers: drivers,
	}
}

func (c *Jacks) Setup() error {
	return c.repo.Setup()
}

func (c *Jacks) Get(id string) (Jack, error) {
	return c.repo.Get(id)
}

func (c *Jacks) List() ([]Jack, error) {
	return c.repo.List()
}

func (c *Jacks) Create(j Jack) error {
	if err := j.IsValid(c.drivers); err != nil {
		return err
	}

	return c.repo.Create(j)
}

func (c *Jacks) Update(id string, j Jack) error {
	if err := j.IsValid(c.drivers); err != nil {
		return err
	}
	return c.repo.Update(id, j)
}

func (c *Jacks) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	return c.repo.Delete(id)
}

func (c *Jacks) LoadAPI(r chi.Router) {
	r.Get("/api/jacks", c.list)
	r.Get("/api/jacks/{id}", c.get)
	r.Put("/api/jacks", c.create)
	r.Post("/api/jacks/{id}", c.update)
	r.Delete("/api/jacks/{id}", c.delete)
	r.Post("/api/jacks/{id}/control", c.control)
}

type PinValues map[int]float64

func (pv PinValues) String() (res string) {
	for p, v := range pv {
		res += fmt.Sprintf("%d:%f ", p, v)
	}
	return
}

func (jacks *Jacks) Control(id string, values PinValues) error {
	j, err := jacks.Get(id)
	if err != nil {
		return err
	}
	for _, pin := range j.Pins {
		v, ok := values[pin]
		if !ok {
			continue
		}
		channel, err := j.pwmChannel(pin, jacks.drivers)
		if err != nil {
			return fmt.Errorf("pin %d on jack %s has no driver: %v", pin, id, err)
		}
		if v > 100 || v < 0 {
			return fmt.Errorf("invalid value:%f for pin: %d", v, pin)
		}
		if j.Reverse {
			v = 100 - v
		}
		if err := channel.Set(v); err != nil {
			return err
		}
	}
	log.Println("connectors: jack", j.Name, "updated pwm values:", values)
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
