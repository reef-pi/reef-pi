package auth

import (
	"fmt"
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/gomniauth/common"
	"github.com/stretchr/gomniauth/providers/google"
	"net/http"
)

type Config struct {
	ID              string   `yaml:"id"`
	Secret          string   `yaml:"secret"`
	CallbackUrl     string   `yaml:"callback_url"`
	Domain          string   `yaml:"domain"`
	Users           []string `yaml:"users"`
	GomniAuthSecret string   `yaml:"gomni_auth_secret"`
}

func (c *Config) Validate() error {
	if c.GomniAuthSecret == "" {
		return fmt.Errorf("Please set auth secret")
	}
	return nil
}

type Auth struct {
	config   Config
	provider common.Provider
}

func Setup(c Config) error {
	if err := c.Validate(); err != nil {
		return err
	}
	gomniauth.SetSecurityKey(c.GomniAuthSecret)
	gomniauth.WithProviders(google.New(c.ID, c.Secret, c.CallbackUrl))
	provider, err := gomniauth.Provider("google")
	if err != nil {
		return err
	}
	a := &Auth{
		config:   c,
		provider: provider,
	}
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "assets/login.html")
	})
	http.HandleFunc("/logout", LogoutHandler)
	http.HandleFunc("/auth/login", a.LoginHandler)
	http.HandleFunc("/auth/callback", a.CallbackHandler)
	return nil
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:   "auth",
		MaxAge: -1,
	})
	w.Header().Set("Location", "/login")
	w.WriteHeader(http.StatusTemporaryRedirect)
}
