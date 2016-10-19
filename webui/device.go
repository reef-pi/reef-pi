package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller/raspi"
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
	log.Println(devices)
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(devices); err != nil {
		log.Println("ERROR:", err)
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
	}
}

func (h *APIHandler) CreateDevice(w http.ResponseWriter, r *http.Request) {
	var dd raspi.DeviceDetails
	if err := json.NewDecoder(r.Body).Decode(&dd); err != nil {
		log.Println("Failed to decode json. Error:", err)
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := h.controller.Devices().Create(dd); err != nil {
		log.Println("Failed to decode json. Error:", err)
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}

}
func (h *APIHandler) GetDevice(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["id"]
	dev, err := h.controller.Devices().Get(name)
	if err != nil {
		log.Println("Failed to retrive specified device")
		errorResponse(http.StatusBadRequest, "Failed to retrieve specified device", w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(dev); err != nil {
		log.Println("ERROR:", err)
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
	}
}
func (h *APIHandler) DeleteDevice(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["id"]
	if err := h.controller.Devices().Delete(name); err != nil {
		log.Println("Failed to delete specified device")
		errorResponse(http.StatusBadRequest, "Failed to delete specified device", w)
		return
	}
}
func (h *APIHandler) UpdateDevice(w http.ResponseWriter, r *http.Request) {
}
