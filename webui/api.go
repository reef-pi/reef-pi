package webui

import (
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
)

const (
	DEFAULT_INTERFACE = "wlan0"
)

type APIHandler struct {
	controller controller.Controller
	Interface  string
}

type DailyJobConfig struct {
	Device string `json:"device"`
	Start  string `json:"start"`
	Stop   string `json:"stop"`
	On     bool   `json:"on"`
}

func NewApiHandler(c controller.Controller, iface string) http.Handler {
	if iface == "" {
		iface = DEFAULT_INTERFACE
	}
	router := mux.NewRouter()
	handler := &APIHandler{
		controller: c,
		Interface:  iface,
	}

	// Info (used by dashboard)
	router.HandleFunc("/api/info", handler.Info).Methods("GET")

	// Device CRUD api
	router.HandleFunc("/api/devices", handler.ListDevices).Methods("GET")
	router.HandleFunc("/api/devices", handler.CreateDevice).Methods("POST")
	router.HandleFunc("/api/devices/{id}", handler.UpdateDevice).Methods("PUT")
	router.HandleFunc("/api/devices/{id}", handler.DeleteDevice).Methods("DELETE")
	router.HandleFunc("/api/devices/{id}", handler.GetDevice).Methods("GET")
	router.HandleFunc("/api/devices/{id}/config", handler.ConfigureDevice).Methods("POST")

	// Module specific configure api
	router.HandleFunc("/api/lighting", handler.EnableLighting).Methods("POST")
	router.HandleFunc("/api/lighting", handler.DisableLighting).Methods("DELETE")
	router.HandleFunc("/api/lighting", handler.LightingConfig).Methods("GET")
	router.HandleFunc("/api/lighting/status", handler.IsLightingEnabled).Methods("GET")

	return router
}
