package api

import (
	"encoding/json"
	"github.com/ranjib/reef-pi/auth"
	"github.com/ranjib/reef-pi/controller"
	"log"
	"net/http"
)

type ServerConfig struct {
	Auth           auth.Config `yaml:"auth"`
	ImageDirectory string      `yaml:"image_directory"`
	Interface      string      `yaml:"interface"`
	DSIDisplay     bool        `yaml:"dsi_display"`
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

func SetupServer(config ServerConfig, c *controller.Controller, enableAuth bool) error {
	server := &Server{
		config: config,
	}
	assets := http.FileServer(http.Dir("assets"))
	docs := http.FileServer(http.Dir("doc"))
	images := http.FileServer(http.Dir(server.config.ImageDirectory))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "assets/home.html")
	})

	if enableAuth {
		log.Println("Enabling authentication")
		if err := auth.Setup(config.Auth); err != nil {
			return err
		}
		http.Handle("/assets/", auth.Check(http.StripPrefix("/assets/", assets)))
		http.Handle("/images/", auth.Check(http.StripPrefix("/images/", images)))
		http.Handle("/doc/", auth.Check(http.StripPrefix("/doc/", docs)))
		http.Handle("/api", auth.Check(NewApiHandler(c, config.Interface, config.DSIDisplay)))

	} else {
		http.Handle("/assets/", http.StripPrefix("/assets/", assets))
		http.Handle("/images/", http.StripPrefix("/images/", images))
		http.Handle("/doc/", http.StripPrefix("/doc/", docs))
		http.Handle("/api/", NewApiHandler(c, config.Interface, config.DSIDisplay))
	}
	return nil
}
