package api

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller"
	"log"
	"net/http"
)

const (
	DEFAULT_INTERFACE = "wlan0"
)

type APIHandler struct {
	controller *controller.Controller
	config     ServerConfig
}

func NewApiHandler(c *controller.Controller, config ServerConfig) *mux.Router {
	if config.Interface == "" {
		config.Interface = DEFAULT_INTERFACE
	}
	return mux.NewRouter()
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
		log.Println("ERROR: GET", r.RequestURI, err)
		return
	}
	h.jsonResponse(payload, w, r)
}

func (h *APIHandler) jsonListResponse(fn func() (interface{}, error), w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	payload, err := fn()
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to list", w)
		log.Println("ERROR: GET", r.RequestURI, err)
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
