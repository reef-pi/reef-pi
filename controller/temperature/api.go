package temperature

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
	"sort"
)

func (t *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/tc/config", t.getConfig).Methods("GET")
	r.HandleFunc("/api/tc/config", t.updateConfig).Methods("POST")
	r.HandleFunc("/api/tc/readings", t.getReadings).Methods("GET")
	r.HandleFunc("/api/tc/usage", t.getUsage).Methods("GET")
}

func (t *Controller) getConfig(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.config, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) getUsage(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		usage := []Usage{}
		t.usage.Do(func(i interface{}) {
			if i != nil {
				u, ok := i.(Usage)
				if !ok {
					log.Println("ERROR: temperature subsystem. Failed to typecast temperature readcontroller usage")
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
	utils.JSONGetResponse(fn, w, r)
}

func (t *Controller) getReadings(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		readings := []Measurement{}
		t.readings.Do(func(i interface{}) {
			if i != nil {
				m, ok := i.(Measurement)
				if !ok {
					log.Println("ERROR: temperature subsystem. Failed to typecast temperature reading")
					return
				}
				readings = append(readings, m)
			}
		})
		sort.Slice(readings, func(i, j int) bool {
			return readings[i].Time.Before(readings[j].Time)
		})
		return readings, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) updateConfig(w http.ResponseWriter, r *http.Request) {
	c.mu.Lock()
	defer c.mu.Unlock()
	var conf Config
	fn := func(_ string) error {
		if err := saveConfig(c.store, conf); err != nil {
			return err
		}
		return c.reload()
	}
	utils.JSONUpdateResponse(&conf, fn, w, r)
}

func (c *Controller) reload() error {
	c.Stop()
	conf, err := loadConfig(c.store)
	if err != nil {
		return err
	}
	c.config = conf
	c.Start()
	return nil
}
