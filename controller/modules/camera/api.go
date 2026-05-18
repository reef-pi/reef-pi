package camera

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

// LoadAPI is a no-op: camera routes are owned by the generated OA3 handler in controller/api.
func (c *Controller) LoadAPI(_ chi.Router) {}

func (c *Controller) GetConfig() Config { return c.config }

func (c *Controller) SaveConfig(conf Config) error {
	if err := c.repo.SaveConfig(conf); err != nil {
		return err
	}
	c.Stop()
	c.mu.Lock()
	c.config = conf
	c.mu.Unlock()
	c.Start()
	return nil
}

func (c *Controller) GetLatest() (map[string]string, error) { return c.repo.Latest() }
func (c *Controller) ListImages() ([]ImageItem, error)      { return c.repo.ListItems() }

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
	fn := func(_ string) (interface{}, error) {
		data, err := c.repo.Latest()
		return &data, err
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) update(w http.ResponseWriter, r *http.Request) {
	var conf Config
	fn := func(id string) error {
		if err := c.repo.SaveConfig(conf); err != nil {
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
