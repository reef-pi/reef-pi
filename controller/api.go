package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
)

func (r *ReefPi) API() error {
	creds, err := r.GetCredentials()
	if err != nil {
		log.Println("ERROR: Failed to load credentials. Error", err)
		creds.User = "reef-pi"
		creds.Password = "reef-pi"
		if err := r.store.Update(Bucket, "credentials", creds); err != nil {
			return err
		}
	}
	err, router := startAPIServer(r.settings.Address, creds)
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
	router.HandleFunc("/api/credentials", r.UpdateCredentials).Methods("POST")
	router.HandleFunc("/api/notification", r.UpdateMailerConfig).Methods("POST")
	router.HandleFunc("/api/notification", r.GetMailerConfig).Methods("GET")
	if r.h != nil {
		router.HandleFunc("/api/health_stats", utils.JSONGetUsage(r.h.usage)).Methods("GET")
	}
	r.outlets.LoadAPI(router)
	r.jacks.LoadAPI(router)
	for _, sController := range r.subsystems {
		sController.LoadAPI(router)
	}
}

func startAPIServer(address string, creds Credentials) (error, *mux.Router) {
	assets := http.FileServer(http.Dir("assets"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "assets/home.html")
	})
	router := mux.NewRouter()
	http.Handle("/assets/", http.StripPrefix("/assets/", assets))
	images := http.FileServer(http.Dir("images"))
	http.Handle("/images/", http.StripPrefix("/images/", images))
	a := utils.NewBasicAuth(creds.User, creds.Password)
	http.Handle("/api/", a.BasicAuth(router.ServeHTTP))
	log.Printf("Starting http server at: %s\n", address)
	go http.ListenAndServe(address, nil)
	return nil, router
}
