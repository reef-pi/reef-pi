package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

func (c *Controller) Capabilities() (capabilities []string) {
	if c.config.Equipments.Enable {
		capabilities = append(capabilities, "equipments")
	}
	if c.config.Timer.Enable {
		capabilities = append(capabilities, "timer")
	}
	if c.config.Lighting.Enable {
		capabilities = append(capabilities, "lighting")
	}
	if c.config.Temperature.Enable {
		capabilities = append(capabilities, "temperature")
	}
	if c.config.ATO.Enable {
		capabilities = append(capabilities, "ato")
	}
	if c.config.System.Enable {
		capabilities = append(capabilities, "system")
	}
	return
}

func (t *Controller) GetCapabilities(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return t.Capabilities(), nil
	}
	utils.JSONGetResponse(fn, w, r)
}
