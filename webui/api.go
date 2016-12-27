package webui

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
)

const (
	DEFAULT_INTERFACE = "wlan0"
)

type APIHandler struct {
	controller *controller.Controller
	Interface  string
}

func NewApiHandler(c *controller.Controller, iface string) http.Handler {
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

	// Boards
	router.HandleFunc("/api/boards/{id}", handler.GetBoard).Methods("GET")
	router.HandleFunc("/api/boards", handler.ListBoards).Methods("GET")
	router.HandleFunc("/api/boards", handler.CreateBoard).Methods("PUT")
	router.HandleFunc("/api/boards/{id}", handler.UpdateBoard).Methods("POST")
	router.HandleFunc("/api/boards/{id}", handler.DeleteBoard).Methods("DELETE")

	// Outlets
	router.HandleFunc("/api/outlets/{id}", handler.GetOutlet).Methods("GET")
	router.HandleFunc("/api/outlets", handler.ListOutlets).Methods("GET")
	router.HandleFunc("/api/outlets", handler.CreateOutlet).Methods("PUT")
	router.HandleFunc("/api/outlets/{id}", handler.UpdateOutlet).Methods("POST")
	router.HandleFunc("/api/outlets/{id}", handler.DeleteOutlet).Methods("DELETE")
	router.HandleFunc("/api/outlets/{id}/configure", handler.ConfigureOutlet).Methods("POST")

	// Equipments
	router.HandleFunc("/api/equipments/{id}", handler.GetEquipment).Methods("GET")
	router.HandleFunc("/api/equipments", handler.ListEquipments).Methods("GET")
	router.HandleFunc("/api/equipments", handler.CreateEquipment).Methods("PUT")
	router.HandleFunc("/api/equipments/{id}", handler.UpdateEquipment).Methods("POST")
	router.HandleFunc("/api/equipments/{id}", handler.DeleteEquipment).Methods("DELETE")

	// Jobs
	router.HandleFunc("/api/jobs/{id}", handler.GetJob).Methods("GET")
	router.HandleFunc("/api/jobs", handler.ListJobs).Methods("GET")
	router.HandleFunc("/api/jobs", handler.CreateJob).Methods("PUT")
	router.HandleFunc("/api/jobs/{id}", handler.UpdateJob).Methods("POST")
	router.HandleFunc("/api/jobs/{id}", handler.DeleteJob).Methods("DELETE")

	return router
}

func (h *APIHandler) jsonGetResponse(fn func(string) (interface{}, error), w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	payload, err := fn(id)
	if err != nil {
		errorResponse(http.StatusNotFound, "Resource not found", w)
		return
	}
	h.jsonResponse(payload, w, r)
}

func (h *APIHandler) jsonListResponse(fn func() (interface{}, error), w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	payload, err := fn()
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to ist", w)
		return
	}
	h.jsonResponse(payload, w, r)
}

func (h *APIHandler) jsonCreateResponse(i interface{}, fn func() error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(i); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := fn(); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to create. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) jsonUpdateResponse(i interface{}, fn func(string) error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(i); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := fn(id); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to update. Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) jsonDeleteResponse(fn func(string) error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	if err := fn(id); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to delete. Error: "+err.Error(), w)
		return
	}
}
