package controller

import (
	"net/http"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (r *ReefPi) GetCapabilities(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.settings.Capabilities, nil
	}
	utils.JSONGetResponse(fn, w, req)
}
