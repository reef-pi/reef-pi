package controller

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func (r *ReefPi) setupAPI() error {
	err, router := startAPIServer(r.settings.Address)
	if err != nil {
		return err
	}
	r.loadAPI(router)
	return nil
}

// API
func (r *ReefPi) loadAPI(router *mux.Router) {
	router.HandleFunc("/api/capabilities", r.GetCapabilities).Methods("GET")
	for _, sController := range r.subsystems {
		sController.LoadAPI(router)
	}
	router.HandleFunc("/api/settings", r.GetSettings).Methods("GET")
	router.HandleFunc("/api/settings", r.UpdateSettings).Methods("POST")
	r.outlets.LoadAPI(router)
	r.jacks.LoadAPI(router)
	for _, sController := range r.subsystems {
		sController.LoadAPI(router)
	}
}

func startAPIServer(address string) (error, *mux.Router) {
	assets := http.FileServer(http.Dir("assets"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "assets/home.html")
	})
	router := mux.NewRouter()
	http.Handle("/assets/", http.StripPrefix("/assets/", assets))
	http.Handle("/api/", router)
	log.Printf("Starting http server at: %s\n", address)
	go http.ListenAndServe(address, nil)
	return nil, router
}
