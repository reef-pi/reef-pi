package webui

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/ranjib/reefer/controller"
	"net/http"
	"time"
)

type APIHandler struct {
	controller controller.Controller
}

type config struct {
	On bool `json:"on"`
}

type DeviceConfig struct {
	Name string `json:"name"`
	On   bool   `json:"state"`
}

type SchedulerConfig struct {
	Device   string `json:"device"`
	Interval string `json:"interval"`
	Duration string `json:"duration"`
}

func errorResponse(header int, msg string, w http.ResponseWriter) {
	log.Errorln(msg)
	resp := make(map[string]string)
	w.WriteHeader(header)
	resp["error"] = msg
	js, jsErr := json.Marshal(resp)
	if jsErr != nil {
		log.Errorln(jsErr)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
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
	router.HandleFunc("/api/device", handler.configureDevice).Methods("POST")
	router.HandleFunc("/api/schedule", handler.configureScheduler).Methods("POST")
	return router
}

func (h *APIHandler) configureScheduler(w http.ResponseWriter, r *http.Request) {
	var c SchedulerConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		errorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	dev, err := h.controller.GetDevice(c.Device)
	if err != nil {
		errorResponse(http.StatusBadRequest, "Cant find device: "+c.Device, w)
		return
	}

	duration, err := time.ParseDuration(c.Duration)
	if err != nil {
		errorResponse(http.StatusBadRequest, "Invalid duration "+c.Duration, w)
		return
	}
	interval, err := time.ParseDuration(c.Interval)
	if err != nil {
		errorResponse(http.StatusBadRequest, "Invalid interval "+c.Duration, w)
		return
	}
	cron := controller.NewPeriodicScheduler(interval, duration)
	if err := h.controller.Schedule(dev, cron); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to schedule. Error: "+err.Error(), w)
	}
}

func (h *APIHandler) configureDevice(w http.ResponseWriter, r *http.Request) {
	var c DeviceConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	dev, err := h.controller.GetDevice(c.Name)
	if err != nil {
		log.Errorln("Cant find device:", c.Name)
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
	js, jsErr := json.Marshal(c)
	if jsErr != nil {
		log.Errorln(jsErr)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)

}

func (h *APIHandler) configureRawDevice(deviceName string, w http.ResponseWriter, r *http.Request) {
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
	h.configureRawDevice("relay_1", w, r)
}

func (h *APIHandler) configureRelay2(w http.ResponseWriter, r *http.Request) {
	h.configureRawDevice("relay_2", w, r)
}

func (h *APIHandler) configureDoser1(w http.ResponseWriter, r *http.Request) {
	h.configureRawDevice("doser_1", w, r)
}

func (h *APIHandler) configureDoser2(w http.ResponseWriter, r *http.Request) {
	h.configureRawDevice("doser_2", w, r)
}
