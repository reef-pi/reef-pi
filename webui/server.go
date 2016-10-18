package webui

import (
	"encoding/json"
	"github.com/ranjib/reefer/controller"
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/gomniauth/providers/google"
	"log"
	"net/http"
)

type OAuthConfig struct {
	OauthID          string `yaml:"id"`
	OauthSecret      string `yaml:"secret"`
	OauthCallbackUrl string `yaml:"callback_url"`
}

type ServerConfig struct {
	Domain          string      `yaml:"domain"`
	Users           []string    `yaml:"users"`
	Auth            OAuthConfig `yaml:"auth"`
	GomniAuthSecret string      `yaml:"gomni_auth_secret"`
	ImageDirectory  string      `yaml:"image_directory"`
}

type Server struct {
	config ServerConfig
}

func errorResponse(header int, msg string, w http.ResponseWriter) {
	log.Println(msg)
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

func (s *Server) SetupOAuth() {
	provider := google.New(s.config.Auth.OauthID, s.config.Auth.OauthSecret, s.config.Auth.OauthCallbackUrl)
	gomniauth.SetSecurityKey(s.config.GomniAuthSecret)
	gomniauth.WithProviders(provider)
}

func SetupServer(config ServerConfig, c controller.Controller, auth bool) {
	server := &Server{
		config: config,
	}
	assets := http.FileServer(http.Dir("assets"))
	images := http.FileServer(http.Dir(server.config.ImageDirectory))

	if auth {
		server.SetupOAuth()
		http.Handle("/", MustAuth(&homePageHandler{}))
		http.Handle("/assets/", MustAuth(http.StripPrefix("/assets/", assets)))
		http.Handle("/images/", MustAuth(http.StripPrefix("/images/", images)))
		http.Handle("/api", MustAuth(NewApiHandler(c)))

		// Auth specific paths
		http.HandleFunc("/auth/", server.loginHandler)
		http.HandleFunc("/logout", logoutHandler)
		http.Handle("/login", &templateHandler{filename: "login.html"})
	} else {
		http.Handle("/", &homePageHandler{})
		http.Handle("/assets/", http.StripPrefix("/assets/", assets))
		http.Handle("/images/", http.StripPrefix("/images/", images))
		http.Handle("/api/", NewApiHandler(c))
	}
}
