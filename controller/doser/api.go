package doser

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/dosers", c.list).Methods("GET")
	r.HandleFunc("/api/dosers/{id}", c.get).Methods("GET")
	r.HandleFunc("/api/dosers", c.create).Methods("PUT")
	r.HandleFunc("/api/dosers/{id}", c.delete).Methods("DELETE")
}

func (c *Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) create(w http.ResponseWriter, r *http.Request) {
	var d Doser
	fn := func() error {
		return c.Create(d)
	}
	utils.JSONCreateResponse(&d, fn, w, r)
}
func (c *Controller) get(w http.ResponseWriter, r *http.Request) {
}
func (c *Controller) delete(w http.ResponseWriter, r *http.Request) {
}
