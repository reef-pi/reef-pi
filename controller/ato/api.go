package ato

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/ato", c.get).Methods("GET")
	r.HandleFunc("/api/ato", c.update).Methods("POST")
	r.HandleFunc("/api/ato/usage", utils.JSONGetUsage(c.usage)).Methods("GET")
}

func (c *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return c.config, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var conf Config
	fn := func(id string) error {
		if err := c.store.Update(Bucket, "config", conf); err != nil {
			return err
		}
		c.config = conf
		c.Stop()
		c.Start()
		return nil
	}
	utils.JSONUpdateResponse(&conf, fn, w, r)
}
