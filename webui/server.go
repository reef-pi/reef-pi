package webui

import (
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/gomniauth/providers/google"
	"net/http"
)

type Server struct {
	AuthDomain       string
	Users            []string
	OauthID          string
	OauthCallbackUrl string
	OauthSecret      string
	GomniAuthSecret  string
}

func (s *Server) Setup() {
	authProvider := google.New(s.OauthID, s.OauthSecret, s.OauthCallbackUrl)
	gomniauth.SetSecurityKey(s.GomniAuthSecret)
	gomniauth.WithProviders(authProvider)

	assets := http.FileServer(http.Dir("assets"))
	http.Handle("/login", &templateHandler{filename: "login.html"})
	http.Handle("/assets", http.StripPrefix("/assets/", assets))
	http.HandleFunc("/auth/", s.loginHandler)
	http.HandleFunc("/logout", logoutHandler)
	http.Handle("/", MustAuth(&homePageHandler{}))
}
