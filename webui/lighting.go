package webui

import (
	"encoding/json"
	"fmt"
	"github.com/ranjib/reefer/controller/raspi"
	"net/http"
)

type LightingStatus struct {
	Enabled bool `json:"enabled"`
}

type LightingDetails struct {
	Enabled     bool  `json:"enabled"`
	Intensities []int `json:"intensities"`
}

func (h *APIHandler) EnableLighting(w http.ResponseWriter, r *http.Request) {
	var c raspi.LightingConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	fmt.Println("API", c)
	if err := h.controller.Lighting().Enable(c); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
}

func (h *APIHandler) DisableLighting(w http.ResponseWriter, r *http.Request) {
	if err := h.controller.Lighting().Disable(); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
}

func (h *APIHandler) LightingConfig(w http.ResponseWriter, r *http.Request) {
	c := h.controller.Lighting().Config()
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(c); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to encode json. Error: "+err.Error(), w)
	}
}

func (h *APIHandler) IsLightingEnabled(w http.ResponseWriter, r *http.Request) {
	isEnabled, err := h.controller.Lighting().IsEnabled()
	if err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	c := LightingStatus{
		Enabled: isEnabled,
	}
	if err := encoder.Encode(c); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
	}
}
