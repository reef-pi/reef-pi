package webui

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/modules"
	"net/http"
)

type APIHandler struct {
	controller modules.Controller
}

type config struct {
	On bool `json:"on"`
}

func NewApiHandler(controller modules.Controller) http.Handler {
	router := mux.NewRouter()
	handler := &APIHandler{
		controller: controller,
	}
	log.Debug("Setting up API server")
	router.HandleFunc("/api/heater", handler.configureHeater).Methods("POST")
	router.HandleFunc("/api/light", handler.configureLight).Methods("POST")
	router.HandleFunc("/api/pump", handler.configurePump).Methods("POST")
	router.HandleFunc("/api/doser", handler.configureDoser).Methods("POST")
	return router
}

func (h *APIHandler) configureHeater(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var c config
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if c.On {
		log.Info("Switching on heater")
		if err := h.controller.Heater().On(); err != nil {
			log.Error(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	} else {
		log.Info("Switching off heater")
		if err := h.controller.Heater().Off(); err != nil {
			log.Error(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	}
	d := make(map[string]string)
	d["state"] = "on"
	js, jsErr := json.Marshal(d)
	if jsErr != nil {
		log.Errorln(jsErr)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}
func (h *APIHandler) configureLight(w http.ResponseWriter, r *http.Request) {}
func (h *APIHandler) configurePump(w http.ResponseWriter, r *http.Request)  {}
func (h *APIHandler) configureDoser(w http.ResponseWriter, r *http.Request) {}
