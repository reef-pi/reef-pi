package temperature

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (t *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/tc", t.GetConfig).Methods("GET")
	r.HandleFunc("/api/tc", t.UpdateConfig).Methods("POST")
}

func (t *Controller) GetConfig(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.config, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) UpdateConfig(w http.ResponseWriter, r *http.Request) {
	c.mu.Lock()
	defer c.mu.Unlock()
	var conf Config
	fn := func(_ string) error {
		if conf.CheckInterval <= 0 {
			return fmt.Errorf("check interval has to ve positive")
		}
		if err := c.store.Update(Bucket, "config", conf); err != nil {
			return err
		}
		c.Stop()
		c.config = conf
		c.Start()
		return nil
	}
	utils.JSONUpdateResponse(&conf, fn, w, r)
}
