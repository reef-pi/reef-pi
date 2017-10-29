package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

type Capabilities struct {
	DevMode       bool `json:"dev_mode" yaml:"dev_mode"`
	Equipments    bool `json:"equipments" yaml:"equipments"`
	Lighting      bool `json:"lighting" yaml:"lighting"`
	Temperature   bool `json:"temperature" yaml:"temperature"`
	ATO           bool `json:"ato" yaml:"ato"`
	Timers        bool `json:"timers" yaml:"timers"`
	Camera        bool `json:"camera" yaml:"camera"`
	Doser         bool `json:"doser" yaml:"doser"`
	Configuration bool `json:"configuration" yaml:"configuration"`
}

var DefaultCapabilities = Capabilities{
	DevMode:       true,
	Equipments:    true,
	Timers:        true,
	Lighting:      true,
	Temperature:   true,
	ATO:           true,
	Camera:        true,
	Doser:         true,
	Configuration: true,
}

func (r *ReefPi) GetCapabilities(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.settings.Capabilities, nil
	}
	utils.JSONGetResponse(fn, w, req)
}
