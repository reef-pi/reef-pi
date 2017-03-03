package api

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/ranjib/reef-pi/controller"
	"log"
	"net/http"
)

const (
	DEFAULT_INTERFACE = "wlan0"
)

type APIHandler struct {
	controller *controller.Controller
	Interface  string
	DSIDisplay bool
}

func NewApiHandler(c *controller.Controller, iface string, dsiDisplay bool) http.Handler {
	if iface == "" {
		iface = DEFAULT_INTERFACE
	}
	router := mux.NewRouter()
	handler := &APIHandler{
		controller: c,
		Interface:  iface,
		DSIDisplay: dsiDisplay,
	}

	// Info (used by dashboard)
	router.HandleFunc("/api/info", handler.Info).Methods("GET")
	router.HandleFunc("/api/display/on", handler.EnableDisplay).Methods("POST")
	router.HandleFunc("/api/display/off", handler.DisableDisplay).Methods("POST")
	router.HandleFunc("/api/display", handler.GetDisplay).Methods("GET")

	// Outlets
	router.HandleFunc("/api/outlets/{id}", handler.GetOutlet).Methods("GET")
	router.HandleFunc("/api/outlets", handler.ListOutlets).Methods("GET")
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

	// Jobs
	router.HandleFunc("/api/ato_configs/{id}", handler.GetATOConfig).Methods("GET")
	router.HandleFunc("/api/ato_configs", handler.ListATOConfigs).Methods("GET")
	router.HandleFunc("/api/ato_configs", handler.CreateATOConfig).Methods("PUT")
	router.HandleFunc("/api/ato_configs/{id}", handler.UpdateATOConfig).Methods("POST")
	router.HandleFunc("/api/ato_configs/{id}", handler.DeleteATOConfig).Methods("DELETE")
	router.HandleFunc("/api/ato/{id}/start", handler.StartATO).Methods("POST")
	router.HandleFunc("/api/ato/{id}/stop", handler.StopATO).Methods("POST")

	// Inlets
	router.HandleFunc("/api/inlets/{id}", handler.GetInlet).Methods("GET")
	router.HandleFunc("/api/inlets", handler.ListInlets).Methods("GET")
	router.HandleFunc("/api/inlets", handler.CreateInlet).Methods("PUT")
	router.HandleFunc("/api/inlets/{id}", handler.UpdateInlet).Methods("POST")
	router.HandleFunc("/api/inlets/{id}", handler.DeleteInlet).Methods("DELETE")

	// Lighting
	router.HandleFunc("/api/lightings/{id}", handler.GetLighting).Methods("GET")
	router.HandleFunc("/api/lightings", handler.ListLightings).Methods("GET")
	router.HandleFunc("/api/lightings", handler.CreateLighting).Methods("PUT")
	router.HandleFunc("/api/lightings/{id}", handler.UpdateLighting).Methods("POST")
	router.HandleFunc("/api/lightings/{id}", handler.DeleteLighting).Methods("DELETE")
	router.HandleFunc("/api/lightings/{id}/enable", handler.EnableLighting).Methods("POST")
	router.HandleFunc("/api/lightings/{id}/disable", handler.DisableLighting).Methods("POST")

	return router
}

func errorResponse(header int, msg string, w http.ResponseWriter) {
	log.Println("ERROR:", msg)
	resp := make(map[string]string)
	w.WriteHeader(header)
	resp["error"] = msg
	js, jsErr := json.Marshal(resp)
	if jsErr != nil {
		log.Println(jsErr)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}
func (h *APIHandler) jsonResponse(payload interface{}, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(payload); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
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
		log.Println(i)
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
