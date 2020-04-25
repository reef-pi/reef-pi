package camera

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r *mux.Router) {

	// swagger:route GET /api/camera/config Camera cameraConfig
	// Get the camera configuration.
	// Get the camera configuration.
	// responses:
	// 	200: body:cameraConfig
	r.HandleFunc("/api/camera/config", c.get).Methods("GET")

	// swagger:operation POST /api/camera/config Camera cameraConfig
	// Save camera configuration.
	// Save camera configuration.
	// ---
	// parameters:
	//  - in: body
	//    name: config
	//    description: camera configuration
	//    required: true
	//    schema:
	//     $ref: '#/definitions/cameraConfig'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/camera/config", c.update).Methods("POST")

	// swagger:route POST /api/camera/shoot Camera cameraConfig
	// Shoot a picture.
	// Shoot a picture.
	// responses:
	// 	200:
	r.HandleFunc("/api/camera/shoot", c.shoot).Methods("POST")

	// swagger:route GET /api/camera/latest Camera cameraLatest
	// Get latest picture.
	// Get latest picture.
	// responses:
	// 	200:
	r.HandleFunc("/api/camera/latest", c.latest).Methods("GET")

	// swagger:route GET /api/camera/list Camera cameraList
	// List images.
	// List all images.
	// responses:
	// 	200:
	r.HandleFunc("/api/camera/list", c.list).Methods("GET")

}

func (c *Controller) get(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return c.config, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) shoot(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) (interface{}, error) {
		data := make(map[string]string)
		f, err := c.Capture()
		data["image"] = f
		return &data, err
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) latest(w http.ResponseWriter, r *http.Request) {
	var data map[string]string
	fn := func(_ string) (interface{}, error) {
		return &data, c.c.Store().Get(Bucket, "latest", &data)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var conf Config
	fn := func(id string) error {
		if err := saveConfig(c.c.Store(), conf); err != nil {
			return err
		}
		c.Stop()
		c.mu.Lock()
		c.config = conf
		c.mu.Unlock()
		c.Start()
		return nil
	}
	utils.JSONUpdateResponse(&conf, fn, w, r)
}
