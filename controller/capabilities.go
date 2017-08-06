package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) Capabilities() (capabilities []string) {
	if c.config.EnableGPIO {
		capabilities = append(capabilities, "gpio")
	}
	if c.config.EnablePWM {
		capabilities = append(capabilities, "pwm")
	}
	if c.config.ATO.Enable {
		capabilities = append(capabilities, "ato")
	}
	if c.config.Lighting.Enable {
		capabilities = append(capabilities, "lighting")
	}
	if c.config.Temperature.Enable {
		capabilities = append(capabilities, "temperature")
	}
	if c.config.AdafruitIO.Enable {
		capabilities = append(capabilities, "telemetry")
	}
	return
}

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/capabilities", c.GetCapabilities).Methods("GET")
}

func (t *Controller) GetCapabilities(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.Capabilities(), nil
	}
	utils.JSONGetResponse(fn, w, r)
}
