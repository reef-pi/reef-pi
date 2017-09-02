package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (r *ReefPi) Capabilities() (capabilities []string) {
	if r.settings.Equipments {
		capabilities = append(capabilities, "equipments")
	}
	if r.settings.Timers {
		capabilities = append(capabilities, "timers")
	}
	if r.settings.Lighting {
		capabilities = append(capabilities, "lighting")
	}
	if r.settings.Temperature {
		capabilities = append(capabilities, "temperature")
	}
	if r.settings.ATO {
		capabilities = append(capabilities, "ato")
	}
	if r.settings.System {
		capabilities = append(capabilities, "system")
	}
	if r.settings.Camera {
		capabilities = append(capabilities, "camera")
	}
	return
}

func (r *ReefPi) GetCapabilities(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.Capabilities(), nil
	}
	utils.JSONGetResponse(fn, w, req)
}
