package daemon

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/utils"
)

var DefaultCredentials = utils.Credentials{
	User:     "reef-pi",
	Password: "reef-pi",
}

func (r *ReefPi) API() error {
	creds, err := r.a.GetCredentials()
	if err != nil {
		log.Println("ERROR: Failed to load credentials. Error", err)
		if err := r.store.Update(Bucket, "credentials", DefaultCredentials); err != nil {
			return err
		}
		creds = DefaultCredentials
	}
	err, router := startAPIServer(r.settings.Address, creds, r.settings.HTTPS)
	if err != nil {
		return err
	}
	r.AuthenticatedAPI(router)
	r.UnAuthenticatedAPI(router)
	if r.settings.Prometheus {
		r.prometheus()
	}
	if os.Getenv("REEF_PI_LIST_API") == "1" {
		utils.SummarizeAPI()
	}
	return nil
}

func (r *ReefPi) UnAuthenticatedAPI(router *mux.Router) {
	router.HandleFunc("/auth/signin", r.a.SignIn).Methods("POST")
	router.HandleFunc("/auth/signout", r.a.SignOut).Methods("GET")
}

// Authenticated API using the BasicAuth middleware
func (r *ReefPi) AuthenticatedAPI(router *mux.Router) {
	http.Handle("/api/", r.a.Authenticate(router.ServeHTTP))

	// swagger:route GET /api/capabilities Capabilities capabilitiesList
	// List all capabilities.
	// List all capabilities in reef-pi.
	// responses:
	// 	200: body:capabilities
	router.HandleFunc("/api/capabilities", r.GetCapabilities).Methods("GET")

	for _, sController := range r.subsystems {
		sController.LoadAPI(router)
	}

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
	for _, sController := range r.subsystems {
		sController.LoadAPI(router)
	}
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

func startAPIServer(address string, creds utils.Credentials, https bool) (error, *mux.Router) {
	assets := http.FileServer(http.Dir("ui/assets"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "ui/home.html")
	})
	http.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "ui/favicon.ico")
	})
	router := mux.NewRouter()
	http.Handle("/assets/", http.StripPrefix("/assets/", assets))
	images := http.FileServer(http.Dir("images"))
	http.Handle("/images/", http.StripPrefix("/images/", images))
	http.Handle("/auth/", router)
	if https {
		if err := utils.GenerateCerts(); err != nil {
			return err, nil
		}
		go func() {
			log.Printf("Starting https server at: %s\n", address)
			if err := http.ListenAndServeTLS(address, "server.crt", "server.key", nil); err != nil {
				log.Println("ERROR: Failed to run https server. Error:", err)
			}
		}()
	} else {
		go func() {
			log.Printf("Starting http server at: %s\n", address)
			if err := http.ListenAndServe(address, nil); err != nil {
				log.Println("ERROR: Failed to run http server. Error:", err)
			}
		}()
	}
	return nil, router
}
