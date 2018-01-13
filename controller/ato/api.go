package ato

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
	"sort"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/ato", c.get).Methods("GET")
	r.HandleFunc("/api/ato", c.update).Methods("POST")
	r.HandleFunc("/api/ato/usage", c.getUsage).Methods("GET")
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

func (c *Controller) GetUsage() ([]Usage, error) {
	usage := []Usage{}
	c.usage.Do(func(i interface{}) {
		if i != nil {
			u, ok := i.(Usage)
			if !ok {
				log.Println("ERROR: ato sub-system. Failed to typecast temperature readcontroller usage")
				return
			}
			usage = append(usage, u)
		}
	})
	sort.Slice(usage, func(i, j int) bool {
		return usage[i].Time.Before(usage[j].Time)
	})
	return usage, nil
}

func (c *Controller) getUsage(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) { return c.GetUsage() }
	utils.JSONGetResponse(fn, w, req)
}
