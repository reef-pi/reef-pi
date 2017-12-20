package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

type Capabilities struct {
	DevMode       bool `json:"dev_mode" yaml:"dev_mode"`
	Dashboard     bool `json:"dashboard" yaml:"dashboard"`
	HealthCheck   bool `json:"health_check" yaml:"health_check"`
	Equipment     bool `json:"equipment" yaml:"equipment"`
	Timers        bool `json:"timers" yaml:"timers"`
	Lighting      bool `json:"lighting" yaml:"lighting"`
	Temperature   bool `json:"temperature" yaml:"temperature"`
	ATO           bool `json:"ato" yaml:"ato"`
	Camera        bool `json:"camera" yaml:"camera"`
	Doser         bool `json:"doser" yaml:"doser"`
	Configuration bool `json:"configuration" yaml:"configuration"`
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
}

func (r *ReefPi) GetCapabilities(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.settings.Capabilities, nil
	}
	utils.JSONGetResponse(fn, w, req)
}
