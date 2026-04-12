package daemon

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func (r *ReefPi) API() error {
	handler := r.serverHandler()
	if os.Getenv("REEF_PI_LIST_API") == "1" {
		utils.SummarizeAPI()
	}
	return startAPIServer(r.settings.Address, r.settings.HTTPS, handler)
}

func (r *ReefPi) UnAuthenticatedAPI(router *mux.Router) {
	router.HandleFunc("/auth/signin", r.a.SignIn).Methods("POST")
	router.HandleFunc("/auth/signout", r.a.SignOut).Methods("GET")
}

// Authenticated API using the BasicAuth middleware
func (r *ReefPi) AuthenticatedAPI(router *mux.Router) {
	// swagger:route GET /api/capabilities Capabilities capabilitiesList
	// List all capabilities.
	// List all capabilities in reef-pi.
	// responses:
	// 	200: body:capabilities
	router.HandleFunc("/api/capabilities", r.GetCapabilities).Methods("GET")

	r.subsystems.LoadAPI(router)

	// swagger:route GET /api/settings Settings settingsList
	// List all settings.
	// List all settings in reef-pi.
	// responses:
	// 	200: body:settings
	utils.APIDoc(router.HandleFunc("/api/settings", r.GetSettings).Methods("GET"), nil, &settings.DefaultSettings)

	// swagger:operation POST /api/settings Settings settingsUpdate
	// Update settings.
	// Update settings.
	//---
	//parameters:
	// - in: body
	//   name: settings
	//   description: The settings to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/settings'
	//responses:
	// 200:
	//  description: OK
	router.HandleFunc("/api/settings", r.UpdateSettings).Methods("POST")

	// swagger:operation POST /api/credentials Credentials credentialsUpdate
	// Update credentials.
	// Update username and password.
	//---
	//parameters:
	// - in: body
	//   name: credentials
	//   description: The new credentials
	//   required: true
	//   schema:
	//    $ref: '#/definitions/credentials'
	//responses:
	// 200:
	//  description: OK
	router.HandleFunc("/api/credentials", r.a.UpdateCredentials).Methods("POST")

	// swagger:route GET /api/telemetry Telemetry telemetryGet
	// List telemetry configuration.
	// List telemetry configuration.
	// responses:
	// 	200: body:telemetryConfig
	router.HandleFunc("/api/telemetry", r.telemetry.GetConfig).Methods("GET")

	// swagger:operation POST /api/telemetry Telemetry telemetryUpdate
	// Update telemetry configuration.
	// Update telemetry configuration.
	//---
	//parameters:
	// - in: body
	//   name: telemetryConfig
	//   description: The telemetry configuration
	//   required: true
	//   schema:
	//    $ref: '#/definitions/telemetryConfig'
	//responses:
	// 200:
	//  description: OK
	router.HandleFunc("/api/telemetry", r.telemetry.UpdateConfig).Methods("POST")

	// swagger:route POST /api/telemetry/test_message Telemetry telemetryTest
	// Test telemetry.
	// Send a telemetry test message.
	// responses:
	//  200:
	router.HandleFunc("/api/telemetry/test_message", r.telemetry.SendTestMessage).Methods("POST")

	// swagger:route DELETE /api/errors/clear Errors errorsClear
	// Clear errors.
	// Clear errors.
	// responses:
	//  200:
	router.HandleFunc("/api/errors/clear", r.clearErrors).Methods("DELETE")

	// swagger:operation DELETE /api/errors/{id} Errors errorsDelete
	// Delete an error.
	// Delete an error.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the error to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	router.HandleFunc("/api/errors/{id}", r.deleteError).Methods("DELETE")

	// swagger:operation GET /api/errors/{id} Errors errorGet
	// Get an error by id.
	// Get an existing error.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the error
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/error'
	//  404:
	//   description: Not Found
	router.HandleFunc("/api/errors/{id}", r.getError).Methods("GET")

	// swagger:route GET /api/errors Errors errorsList
	// List errors.
	// List errors.
	// responses:
	// 	200: body:[]error
	router.HandleFunc("/api/errors", r.listErrors).Methods("GET")

	// swagger:route GET /api/me Me meGet
	// Ping API.
	// Ping API to determine if server is running.
	// responses:
	// 	200:
	router.HandleFunc("/api/me", r.a.Me).Methods("GET")

	if r.h != nil {
		router.HandleFunc("/api/health_stats", r.h.GetStats).Methods("GET")
	}
	r.dm.LoadAPI(router)
	r.subsystems.LoadAPI(router)
	if r.settings.Capabilities.Dashboard {

		// swagger:route GET /api/dashboard Dashboard dashboardGet
		// Get dashboard.
		// Get dashboard.
		// responses:
		// 	200: body:dashboard
		router.HandleFunc("/api/dashboard", r.GetDashboard).Methods("GET")

		// swagger:operation POST /api/dashboard Dashboard dashboardUpdate
		// Update dasboard configuration.
		// Update dasboard configuration.
		//---
		//parameters:
		// - in: body
		//   name: dashboardConfiguration
		//   description: The dashboard configuration
		//   required: true
		//   schema:
		//    $ref: '#/definitions/dashboard'
		//responses:
		// 200:
		//  description: OK
		router.HandleFunc("/api/dashboard", r.UpdateDashboard).Methods("POST")
	}
}

func (r *ReefPi) serverHandler() http.Handler {
	root := mux.NewRouter()

	root.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "ui/home.html")
	})
	root.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "ui/favicon.ico")
	})
	root.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir("ui/assets"))))
	root.PathPrefix("/images/").Handler(http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))

	authRouter := mux.NewRouter()
	r.UnAuthenticatedAPI(authRouter)
	root.PathPrefix("/auth/").Handler(authRouter)

	apiRouter := mux.NewRouter()
	if r.settings.CORS {
		apiRouter.Use(corsMiddleware)
	}
	r.AuthenticatedAPI(apiRouter)
	root.PathPrefix("/api/").Handler(r.a.Authenticate(apiRouter.ServeHTTP))

	if r.h != nil {
		apiRouter.HandleFunc("/api/health_stats", r.h.GetStats).Methods("GET")
	}
	if r.settings.Prometheus {
		r.prometheus(root)
	}

	return root
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "*")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		next.ServeHTTP(w, r)
	})
}

func startAPIServer(address string, https bool, handler http.Handler) error {
	if https {
		if err := utils.GenerateCerts(); err != nil {
			return err
		}
		go func() {
			log.Printf("Starting https server at: %s\n", address)
			if err := http.ListenAndServeTLS(address, "server.crt", "server.key", handler); err != nil {
				log.Println("ERROR: Failed to run https server. Error:", err)
			}
		}()
		return nil
	}

	go func() {
		log.Printf("Starting http server at: %s\n", address)
		if err := http.ListenAndServe(address, handler); err != nil {
			log.Println("ERROR: Failed to run http server. Error:", err)
		}
	}()
	return nil
}
