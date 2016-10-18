package webui

import (
	"encoding/json"
	"log"
	"net/http"
)

func (h *APIHandler) ListDevices(w http.ResponseWriter, r *http.Request) {
	devices, err := h.controller.Devices().List()
	if err != nil {
		log.Println("Failed to retrive device list")
		errorResponse(http.StatusInternalServerError, "Failed to retrieve device list", w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(devices); err != nil {
		log.Println("ERROR:", err)
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
	}
}
func (h *APIHandler) CreateDevice(w http.ResponseWriter, r *http.Request) {
}
func (h *APIHandler) GetDevice(w http.ResponseWriter, r *http.Request) {
}
func (h *APIHandler) DeleteDevice(w http.ResponseWriter, r *http.Request) {
}
func (h *APIHandler) UpdateDevice(w http.ResponseWriter, r *http.Request) {
}
