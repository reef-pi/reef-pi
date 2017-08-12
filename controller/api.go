package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/capabilities", c.GetCapabilities).Methods("GET")
	if c.config.Equipments.Enable {
		c.state.equipments.LoadAPI(r)
	}
	if c.config.Lighting.Enable {
		c.state.lighting.LoadAPI(r)
	}
	if c.config.Temperature.Enable {
		c.state.temperature.LoadAPI(r)
	}
	if c.config.System.Enable {
		c.state.system.LoadAPI(r)
	}
	if c.config.Timer.Enable {
		c.state.timer.LoadAPI(r)
	}
}

func (t *Controller) GetCapabilities(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return t.Capabilities(), nil
	}
	utils.JSONGetResponse(fn, w, r)
}
