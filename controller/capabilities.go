package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (r *ReefPi) Capabilities() (capabilities []string) {
	if r.config.Equipments.Enable {
		capabilities = append(capabilities, "equipments")
	}
	if r.config.Timers.Enable {
		capabilities = append(capabilities, "timers")
	}
	if r.config.Lighting.Enable {
		capabilities = append(capabilities, "lighting")
	}
	if r.config.Temperature.Enable {
		capabilities = append(capabilities, "temperature")
	}
	if r.config.ATO.Enable {
		capabilities = append(capabilities, "ato")
	}
	if r.config.System.Enable {
		capabilities = append(capabilities, "system")
	}
	return
}

func (r *ReefPi) GetCapabilities(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.Capabilities(), nil
	}
	utils.JSONGetResponse(fn, w, req)
}
