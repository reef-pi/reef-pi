package webui

import (
	"encoding/json"
	"log"
	"net/http"
)

type LightingConfig struct {
	Intensities []int `json:"intensities"`
	On          bool  `json:"on"`
}

func (h *APIHandler) SetLighting(w http.ResponseWriter, r *http.Request) {
	var c LightingConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		log.Println("Failed to decode json. Error:", err)
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	log.Println(c)
}

func (h *APIHandler) UnsetLighting(w http.ResponseWriter, r *http.Request) {
}
