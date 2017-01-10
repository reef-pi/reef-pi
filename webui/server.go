package webui

import (
	"encoding/json"
	"github.com/ranjib/reefer/controller"
	"log"
	"net/http"
)

type ServerConfig struct {
	Auth           AuthConfig `yaml:"auth"`
	ImageDirectory string     `yaml:"image_directory"`
	Interface      string     `yaml:"interface"`
	DSIDisplay     bool       `yaml:"dsi_display"`
}

type Server struct {
	config ServerConfig
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

func SetupServer(config ServerConfig, c *controller.Controller, auth bool) error {
	server := &Server{
		config: config,
	}
	assets := http.FileServer(http.Dir("assets"))
	docs := http.FileServer(http.Dir("doc"))
	images := http.FileServer(http.Dir(server.config.ImageDirectory))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "assets/home.html")
	})

	if auth {
		log.Println("Enabling authentication")
		if err := config.Auth.Validate(); err != nil {
			return err
		}
		config.Auth.SetupOAuth()
		http.Handle("/assets/", MustAuth(http.StripPrefix("/assets/", assets)))
		http.Handle("/images/", MustAuth(http.StripPrefix("/images/", images)))
		http.Handle("/doc/", MustAuth(http.StripPrefix("/doc/", docs)))
		http.Handle("/api", MustAuth(NewApiHandler(c, config.Interface, config.DSIDisplay)))

		// Auth specific paths
		http.HandleFunc("/auth/", server.loginHandler)
		http.HandleFunc("/logout", logoutHandler)
		http.Handle("/login", &templateHandler{filename: "login.html"})
	} else {
		http.Handle("/assets/", http.StripPrefix("/assets/", assets))
		http.Handle("/images/", http.StripPrefix("/images/", images))
		http.Handle("/doc/", http.StripPrefix("/doc/", docs))
		http.Handle("/api/", NewApiHandler(c, config.Interface, config.DSIDisplay))
	}
	return nil
}
