package webui

import (
	"github.com/ranjib/reefer/controller"
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/gomniauth/providers/google"
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
}

type Server struct {
	config ServerConfig
}

func (s *Server) SetupOAuth() {
	provider := google.New(s.config.Auth.OauthID, s.config.Auth.OauthSecret, s.config.Auth.OauthCallbackUrl)
	gomniauth.SetSecurityKey(s.config.GomniAuthSecret)
	gomniauth.WithProviders(provider)
}

func SetupServer(config ServerConfig, c controller.Controller, auth bool, imageDirectory string) {
	server := &Server{
		config: config,
	}
	assets := http.FileServer(http.Dir("assets"))
	images := http.FileServer(http.Dir(imageDirectory))

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
