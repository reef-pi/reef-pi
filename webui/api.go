package webui

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
)

type APIHandler struct {
	controller controller.Controller
}

type config struct {
	On bool `json:"on"`
}

func NewApiHandler(c controller.Controller) http.Handler {
	router := mux.NewRouter()
	handler := &APIHandler{
		controller: c,
	}
	log.Debug("Setting up API server")
	router.HandleFunc("/api/relay_1", handler.configureRelay1).Methods("POST")
	router.HandleFunc("/api/relay_2", handler.configureRelay2).Methods("POST")
	router.HandleFunc("/api/doser_1", handler.configureDoser1).Methods("POST")
	router.HandleFunc("/api/doser_2", handler.configureDoser2).Methods("POST")
	return router
}

func (h *APIHandler) configureDevice(deviceName string, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dev, err := h.controller.GetDevice(deviceName)
	if err != nil {
		log.Errorln("Cant find device:", deviceName)
		log.Error(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	var c config
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if c.On {
		log.Info("Switching on:", dev.Name())
		if err := dev.On(); err != nil {
			log.Error(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
	} else {
		log.Info("Switching off:", dev.Name())
		if err := dev.Off(); err != nil {
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

func (h *APIHandler) configureRelay1(w http.ResponseWriter, r *http.Request) {
	h.configureDevice("relay_1", w, r)
}

func (h *APIHandler) configureRelay2(w http.ResponseWriter, r *http.Request) {
	h.configureDevice("relay_2", w, r)
}

func (h *APIHandler) configureDoser1(w http.ResponseWriter, r *http.Request) {
	h.configureDevice("doser_1", w, r)
}

func (h *APIHandler) configureDoser2(w http.ResponseWriter, r *http.Request) {
	h.configureDevice("doser_2", w, r)
}
