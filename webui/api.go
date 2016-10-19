package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"log"
	"net/http"
)

type APIHandler struct {
	controller controller.Controller
}

type DeviceConfig struct {
	Name string `json:"name"`
	On   bool   `json:"on"`
}

type DailyJobConfig struct {
	Device string `json:"device"`
	Start  string `json:"start"`
	Stop   string `json:"stop"`
	On     bool   `json:"on"`
}

func NewApiHandler(c controller.Controller) http.Handler {
	router := mux.NewRouter()
	handler := &APIHandler{
		controller: c,
	}
	router.HandleFunc("/api/device", handler.configureDevice).Methods("POST")
	router.HandleFunc("/api/schedule", handler.configureDailyJob).Methods("POST")
	router.HandleFunc("/api/ato", handler.configureATO).Methods("POST")

	// Device CRUD api
	router.HandleFunc("/api/devices", handler.ListDevices).Methods("GET")
	router.HandleFunc("/api/devices", handler.CreateDevice).Methods("POST")
	router.HandleFunc("/api/devices/{id}", handler.UpdateDevice).Methods("PUT")
	router.HandleFunc("/api/devices/{id}", handler.DeleteDevice).Methods("DELETE")
	router.HandleFunc("/api/devices/{id}", handler.GetDevice).Methods("GET")

	return router
}

func (h *APIHandler) configureATO(w http.ResponseWriter, r *http.Request) {
	var c controller.ATOConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		log.Println("Failed to decode json. Error:", err)
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	ato, err := h.controller.GetModule("ato")
	if err != nil {
		log.Println("ATO is not present")
		errorResponse(http.StatusBadRequest, "ATO is not present", w)
		return
	}
	if err := ato.Configure(c); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to configre ATO. Error: "+err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(c); err != nil {
		log.Println("ERROR:", err)
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
	}
}

func (h *APIHandler) configureDailyJob(w http.ResponseWriter, r *http.Request) {
	var c DailyJobConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		log.Println("Failed to decode json. Error:", err)
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	dev, err := h.controller.GetDevice(c.Device)
	if err != nil {
		log.Println("No device present with name:", c.Device)
		errorResponse(http.StatusBadRequest, "Cant find device: "+c.Device, w)
		return
	}

	j, err := controller.NewDailyJob(c.Start, c.Stop)
	if err != nil {
		errorResponse(http.StatusBadRequest, "Failed to create daily jon. Error: "+err.Error(), w)
		return
	}
	if err := h.controller.Schedule(dev, j); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to schedule. Error: "+err.Error(), w)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(c); err != nil {
		log.Println("ERROR:", err)
		errorResponse(http.StatusInternalServerError, "Failed to schedule. Error: "+err.Error(), w)
	}
}

func (h *APIHandler) configureDevice(w http.ResponseWriter, r *http.Request) {
	var c DeviceConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	dev, err := h.controller.GetDevice(c.Name)
	if err != nil {
		log.Println("Cant find device:", c.Name)
		log.Println("ERROR:", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	if c.On {
		log.Println("Switching on:", dev.Name())
		if err := dev.On(); err != nil {
			log.Println("ERROR:", err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	} else {
		log.Println("Switching off:", dev.Name())
		if err := dev.Off(); err != nil {
			log.Println("ERROR:", err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	}
	js, jsErr := json.Marshal(c)
	if jsErr != nil {
		log.Println("ERROR:", jsErr)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}
