package webui

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
)

func apiHandler() http.Handler {
	router := mux.NewRouter()
	log.Debug("Setting up API server")
	router.HandleFunc("/api/heater", configureHeater).Methods("POST")
	router.HandleFunc("/api/light", configureLight).Methods("POST")
	router.HandleFunc("/api/pump", configurePump).Methods("POST")
	router.HandleFunc("/api/doser", configureDoser).Methods("POST")
	return router
}

func configureHeater(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Errorln(err)
		return
	}
	log.Info("Request:")
	log.Info(string(data))
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
func configureLight(w http.ResponseWriter, r *http.Request) {}
func configurePump(w http.ResponseWriter, r *http.Request)  {}
func configureDoser(w http.ResponseWriter, r *http.Request) {}
