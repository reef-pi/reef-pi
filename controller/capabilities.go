package controller

import (
	"net/http"

	"github.com/reef-pi/reef-pi/controller/utils"
)

type Capabilities struct {
	DevMode       bool `json:"dev_mode"`
	Dashboard     bool `json:"dashboard"`
	HealthCheck   bool `json:"health_check"`
	Equipment     bool `json:"equipment"`
	Timers        bool `json:"timers"`
	Lighting      bool `json:"lighting"`
	Temperature   bool `json:"temperature"`
	ATO           bool `json:"ato"`
	Camera        bool `json:"camera"`
	Doser         bool `json:"doser"`
	Ph            bool `json:"ph"`
	Macro         bool `json:"macro"`
	Configuration bool `json:"configuration"`
}

var DefaultCapabilities = Capabilities{
	DevMode:       false,
	Dashboard:     true,
	HealthCheck:   true,
	Equipment:     true,
	Timers:        true,
	Lighting:      false,
	Temperature:   true,
	ATO:           true,
	Configuration: true,
	Macro:         true,
}

func (r *ReefPi) GetCapabilities(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.settings.Capabilities, nil
	}
	utils.JSONGetResponse(fn, w, req)
}
