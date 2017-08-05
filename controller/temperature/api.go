package temperature

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (t *Controller) LoadAPI(r mux.Router) {
	r.HandleFunc("/api/tc", t.GetConfig).Methods("GET")
	r.HandleFunc("/api/tc", t.UpdateConfig).Methods("POST")
}

func (t *Controller) GetConfig(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.config, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) UpdateConfig(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) error {
		return nil
	}
	utils.JSONUpdateResponse(&t.config, fn, w, r)
}
