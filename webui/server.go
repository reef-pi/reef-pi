package webui

import (
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/gomniauth/providers/google"
	"net/http"
)

type Server struct {
	Domain           string
	Users            []string
	OauthID          string
	OauthCallbackUrl string
	OauthSecret      string
	GomniAuthSecret  string
	ImageDirectory   string
}

func (s *Server) Setup(auth bool) {
	authProvider := google.New(s.OauthID, s.OauthSecret, s.OauthCallbackUrl)
	gomniauth.SetSecurityKey(s.GomniAuthSecret)
	gomniauth.WithProviders(authProvider)
	assets := http.FileServer(http.Dir("assets"))
	images := http.FileServer(http.Dir(s.ImageDirectory))

	if auth {
		http.Handle("/", MustAuth(&homePageHandler{}))
		http.Handle("/assets/", MustAuth(http.StripPrefix("/assets/", assets)))
		http.Handle("/images/", MustAuth(http.StripPrefix("/images/", images)))
		http.Handle("/api", MustAuth(apiHandler()))

		// Auth specific paths
		http.HandleFunc("/auth/", s.loginHandler)
		http.HandleFunc("/logout", logoutHandler)
		http.Handle("/login", &templateHandler{filename: "login.html"})
	} else {
		http.Handle("/", &homePageHandler{})
		http.Handle("/assets/", http.StripPrefix("/assets/", assets))
		http.Handle("/images/", http.StripPrefix("/images/", images))
		http.Handle("/api/", apiHandler())
	}
}
