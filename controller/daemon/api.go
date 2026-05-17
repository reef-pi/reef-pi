package daemon

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (r *ReefPi) API() error {
	handler := r.serverHandler()
	return startAPIServer(r.settings.Address, r.settings.HTTPS, handler)
}

func (r *ReefPi) UnAuthenticatedAPI(router chi.Router) {
	router.Post("/auth/signin", r.a.SignIn)
	router.Get("/auth/signout", r.a.SignOut)
}

// Authenticated API using the BasicAuth middleware
func (r *ReefPi) AuthenticatedAPI(router chi.Router) {
	r.registerCoreAPI(router)
	r.registerTelemetryAPI(router)
	r.registerErrorAPI(router)
	r.registerRuntimeAPI(router)
	r.dm.LoadAPI(router)
	r.subsystems.LoadAPI(router)
	r.registerDashboardAPI(router)
}

func (r *ReefPi) registerCoreAPI(router chi.Router) {
	router.Get("/api/capabilities", r.GetCapabilities)
	router.Get("/api/settings", r.GetSettings)
	router.Post("/api/settings", r.UpdateSettings)
	router.Post("/api/credentials", r.a.UpdateCredentials)
}

func (r *ReefPi) registerTelemetryAPI(router chi.Router) {
	router.Get("/api/telemetry", r.telemetry.GetConfig)
	router.Post("/api/telemetry", r.telemetry.UpdateConfig)
	router.Post("/api/telemetry/test_message", r.telemetry.SendTestMessage)
}

func (r *ReefPi) registerErrorAPI(router chi.Router) {
	router.Delete("/api/errors/clear", r.clearErrors)
	router.Delete("/api/errors/{id}", r.deleteError)
	router.Get("/api/errors/{id}", r.getError)
	router.Get("/api/errors", r.listErrors)
}

func (r *ReefPi) registerRuntimeAPI(router chi.Router) {
	router.Get("/api/me", r.a.Me)

	if r.settings.Capabilities.DevMode {
		router.Post("/api/dev/smoke/reset", r.ResetSmokeState)
	}

	if r.h != nil {
		router.Get("/api/health_stats", r.h.GetStats)
	}
}

func (r *ReefPi) registerDashboardAPI(router chi.Router) {
	if !r.settings.Capabilities.Dashboard {
		return
	}

	router.Get("/api/dashboard", r.GetDashboard)
	router.Post("/api/dashboard", r.UpdateDashboard)
}

func (r *ReefPi) serverHandler() http.Handler {
	root := chi.NewRouter()

	root.Get("/", func(w http.ResponseWriter, req *http.Request) {
		http.ServeFile(w, req, "ui/home.html")
	})
	root.Get("/favicon.ico", func(w http.ResponseWriter, req *http.Request) {
		http.ServeFile(w, req, "ui/favicon.ico")
	})
	root.Handle("/assets/*", http.StripPrefix("/assets/", http.FileServer(http.Dir("ui/assets"))))
	root.Handle("/images/*", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))

	r.UnAuthenticatedAPI(root)

	root.Group(func(router chi.Router) {
		router.Use(func(next http.Handler) http.Handler {
			return r.a.Authenticate(next.ServeHTTP)
		})
		if r.settings.CORS {
			router.Use(corsMiddleware)
		}
		r.AuthenticatedAPI(router)
	})

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

