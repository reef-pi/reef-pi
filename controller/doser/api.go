package doser

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
	"time"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/doser/pumps", c.list).Methods("GET")
	r.HandleFunc("/api/doser/pumps/{id}", c.get).Methods("GET")
	r.HandleFunc("/api/doser/pumps", c.create).Methods("PUT")
	r.HandleFunc("/api/doser/pumps/{id}", c.update).Methods("POST")
	r.HandleFunc("/api/doser/pumps/{id}", c.delete).Methods("DELETE")
	r.HandleFunc("/api/doser/pumps/{id}/calibrate", c.calibrate).Methods("POST")
	r.HandleFunc("/api/doser/pumps/{id}/schedule", c.schedule).Methods("POST")
}

func (c *Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var p Pump
	fn := func() error {
		return c.Create(p)
	}
	utils.JSONCreateResponse(&p, fn, w, r)
}

func (c *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

type CalibrationDetails struct {
	Speed    int           `json:"speed"`
	Duration time.Duration `json:"duration"`
}

// {"speed":16,"duration":12}
func (c *Controller) calibrate(w http.ResponseWriter, r *http.Request) {
	var cal CalibrationDetails
	fn := func(id string) error {
		return c.Calibrate(id, cal)
	}
	utils.JSONUpdateResponse(&cal, fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var p Pump
	fn := func(id string) error {
		return c.Update(id, p)
	}
	utils.JSONUpdateResponse(&p, fn, w, r)
}

// {"schedule":{"day":"*","hour":"*","minute":"*","second":"*"},"duration":"10","speed":"31"}
type Schedule struct {
	Day    string `json:"day"`
	Hour   string `json:"hour"`
	Minute string `json:"minute"`
	Second string `json:"second"`
}

type DosingSchedule struct {
	Schedule Schedule      `json:"schedule"`
	Duration time.Duration `json:"durartion"`
}

func (c *Controller) schedule(w http.ResponseWriter, r *http.Request) {
	var sc DosingSchedule
	fn := func(id string) error {
		return c.Schedule(id, sc)
	}
	utils.JSONUpdateResponse(&sc, fn, w, r)
}
