package manager

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
)

type mgr struct {
	store storage.Store
	t     telemetry.Telemetry
	is    *instances
	conf  Config
	h     telemetry.HealthChecker
	a     utils.Auth
}

func New(v string) (*mgr, error) {
	database := "rp-manager.db"
	store, err := storage.NewStore(database)
	if err != nil {
		log.Println("ERROR: Failed to create store. DB:", database)
		return nil, err
	}
	conf, err := loadConfiguration(store)
	if err != nil {
		log.Println("Warning: Failed to load configuration from db, Error:", err)
		log.Println("Warning: Initializing default configuration in database")
		iConf, err := initializeConfiguration(store)
		if err != nil {
			return nil, err
		}
		conf = iConf
	}
	fn := func(_, _ string) error { return nil }
	t := telemetry.Initialize(Bucket, store, fn, conf.Notification)
	return &mgr{
		store: store,
		t:     t,
		conf:  conf,
		is: &instances{
			store: store,
			tele:  t,
		},
		a: utils.NewAuth(Bucket, store),
	}, nil
}

func (m *mgr) Start() error {
	return m.store.CreateBucket(InstancesBucket)
}

func (m *mgr) API() error {
	assets := http.FileServer(http.Dir("ui/assets"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "ui/home.html")
	})
	http.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "ui/favicon.ico")
	})
	router := mux.NewRouter()
	http.Handle("/assets/", http.StripPrefix("/assets/", assets))
	http.Handle("/auth/", router)
	if m.conf.HTTPS {
		if err := utils.GenerateCerts(); err != nil {
			return nil
		}
		go func() {
			log.Printf("Starting https server at: %s\n", m.conf.Address)
			if err := http.ListenAndServeTLS(m.conf.Address, "server.crt", "server.key", nil); err != nil {
				log.Println("ERROR: Failed to run https server. Error:", err)
			}
		}()
	} else {
		go func() {
			log.Printf("Starting http server at: %s\n", m.conf.Address)
			if err := http.ListenAndServe(m.conf.Address, nil); err != nil {
				log.Println("ERROR: Failed to run http server. Error:", err)
			}
		}()
	}
	router.HandleFunc("/auth/signin", m.a.SignIn).Methods("POST")
	router.HandleFunc("/auth/signout", m.a.SignOut).Methods("GET")
	router.HandleFunc("/api/capabilities", m.GetCapabilities).Methods("GET")
	m.AuthenticatedAPI(router)
	return nil
}

func (m *mgr) AuthenticatedAPI(router *mux.Router) {
	http.Handle("/api/", m.a.Authenticate(router.ServeHTTP))
	router.HandleFunc("/api/credentials", m.a.UpdateCredentials).Methods("POST")
	router.HandleFunc("/api/me", m.a.Me).Methods("GET")

	router.HandleFunc("/api/telemetry", m.t.GetConfig).Methods("GET")
	router.HandleFunc("/api/telemetry", m.t.UpdateConfig).Methods("POST")
	router.HandleFunc("/api/telemetry/test_message", m.t.SendTestMessage).Methods("POST")
	/*
		router.HandleFunc("/api/settings", m.GetSettings).Methods("GET")
		router.HandleFunc("/api/settings", m.UpdateSettings).Methods("POST")
		router.HandleFunc("/api/errors/clear", m.clearErrors).Methods("DELETE")
		router.HandleFunc("/api/errors/{id}", m.deleteError).Methods("DELETE")
		router.HandleFunc("/api/errors/{id}", m.getError).Methods("GET")
		router.HandleFunc("/api/errors", m.listErrors).Methods("GET")
	*/
	if m.h != nil {
		router.HandleFunc("/api/health_stats", m.h.GetStats).Methods("GET")
	}
	m.is.LoadAPI(router)
}
func (m *mgr) Stop() {
	m.store.Close()
}
func (m *mgr) GetCapabilities(w http.ResponseWriter, req *http.Request) {
	caps := make(map[string]bool)
	caps["manager"] = true
	fn := func(_ string) (interface{}, error) {
		return caps, nil
	}
	utils.JSONGetResponse(fn, w, req)
}
