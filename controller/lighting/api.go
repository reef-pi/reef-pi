package lighting

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/lights", c.ListLights).Methods("GET")
	r.HandleFunc("/api/lights", c.CreateLight).Methods("PUT")
	r.HandleFunc("/api/lights/{id}", c.GetLight).Methods("GET")
	r.HandleFunc("/api/lights/{id}", c.UpdateLight).Methods("POST")
	r.HandleFunc("/api/lights/{id}", c.DeleteLight).Methods("DELETE")

	r.HandleFunc("/api/jacks", c.listJacks).Methods("GET")
	r.HandleFunc("/api/jacks/{id}", c.getJack).Methods("GET")
	r.HandleFunc("/api/jacks", c.createJack).Methods("PUT")
	r.HandleFunc("/api/jacks/{id}", c.updateJack).Methods("POST")
	r.HandleFunc("/api/jacks/{id}", c.deleteJack).Methods("DELETE")
}

func (c *Controller) GetLight(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) ListLights(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}
func (c *Controller) CreateLight(w http.ResponseWriter, r *http.Request) {
	var l Light
	fn := func() error {
		return c.Create(l)
	}
	utils.JSONCreateResponse(&l, fn, w, r)
}
func (c *Controller) UpdateLight(w http.ResponseWriter, r *http.Request) {
	var l Light
	fn := func(id string) error {
		return c.Update(id, l)
	}
	utils.JSONUpdateResponse(&l, fn, w, r)
}
func (c *Controller) DeleteLight(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) getJack(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.GetJack(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) listJacks(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.ListJacks()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) createJack(w http.ResponseWriter, r *http.Request) {
	var j Jack
	fn := func() error {
		return c.CreateJack(j)
	}
	utils.JSONCreateResponse(&j, fn, w, r)
}

func (c *Controller) updateJack(w http.ResponseWriter, r *http.Request) {
	var j Jack
	fn := func(id string) error {
		return c.UpdateJack(id, j)
	}
	utils.JSONUpdateResponse(&j, fn, w, r)
}
func (c *Controller) deleteJack(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.DeleteJack(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
