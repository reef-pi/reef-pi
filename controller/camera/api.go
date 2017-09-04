package camera

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/camera/config", c.get).Methods("GET")
	r.HandleFunc("/api/camera/config", c.update).Methods("POST")
	r.HandleFunc("/api/camera/shoot", c.shoot).Methods("POST")
	r.HandleFunc("/api/camera/latest", c.latest).Methods("GET")

}

func (c *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return c.config, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) shoot(w http.ResponseWriter, r *http.Request) {
	var data map[string]string
	fn := func(_ string) (interface{}, error) {
		f, err := c.Capture()
		data["image"] = f
		return &data, err
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) latest(w http.ResponseWriter, r *http.Request) {
	var data map[string]string
	fn := func(_ string) (interface{}, error) {
		return &data, c.store.Get(Bucket, "latest", &data)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var conf Config
	fn := func(id string) error {
		if err := c.store.Update(Bucket, "config", &conf); err != nil {
			return err
		}
		c.config = conf
		c.Stop()
		c.Start()
		return nil
	}
	utils.JSONUpdateResponse(&conf, fn, w, r)
}
