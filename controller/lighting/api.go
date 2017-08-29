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
