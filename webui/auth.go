package webui

import (
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/objx"
	"net/http"
	"strings"
)

type authHandler struct {
	next http.Handler
}

func (h *authHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if _, err := r.Cookie("auth"); err == http.ErrNoCookie {
		w.Header().Set("Location", "/login")
		log.Println("Not authenticated")
		w.WriteHeader(http.StatusTemporaryRedirect)
	} else if err != nil {
		panic(err.Error())
	} else {
		h.next.ServeHTTP(w, r)
	}
}

// MustAuth Enforce google oauth
func MustAuth(handler http.Handler) http.Handler {
	return &authHandler{next: handler}
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Logout handler invoked")
	http.SetCookie(w, &http.Cookie{
		Name:   "auth",
		MaxAge: -1,
	})
	w.Header().Set("Location", "/login")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	segs := strings.Split(r.URL.Path, "/")
	action := segs[2]
	switch action {
	case "login":
		provider, err := gomniauth.Provider(segs[3])
		if err != nil {
			log.Fatalln("Error when trying to get provider", provider, " Error: ", err)
		}

		loginURL, err := provider.GetBeginAuthURL(nil, nil)
		if err != nil {
			log.Fatalln("Error when trying to get BeginAuthURL", provider, " Error: ", err)
		}
		w.Header().Set("Location", loginURL)
		w.WriteHeader(http.StatusTemporaryRedirect)
	case "callback":
		provider, err := gomniauth.Provider(segs[3])
		if err != nil {
			log.Fatalln("Error when trying to get provider", provider, " Error: ", err)
		}
		creds, err := provider.CompleteAuth(objx.MustFromURLQuery(r.URL.RawQuery))
		if err != nil {
			log.Fatalln("Error while trying to complete auth for ", provider, " Error: ", err)
		}
		user, err := provider.GetUser(creds)
		if err != nil {
			log.Fatalln("Error while trying to get user from ", provider, " Error: ", err)
		}
		parts := strings.Split(user.Email(), "@")
		// externalize config
		if parts[1] != s.AuthDomain {
			log.Fatalln("Not a valid user. Domain:", parts[1])
		}
		found := false
		for _, u := range s.Users {
			if u == parts[0] {
				found = true
				break
			}
		}
		if !found {
			log.Fatalln("Not a valid user. id:", parts[0])
		}
		authCookieValue := objx.New(map[string]interface{}{
			"name": user.Name(),
		}).MustBase64()
		http.SetCookie(w, &http.Cookie{
			Name:  "auth",
			Value: authCookieValue,
			Path:  "/"})
		w.Header()["Location"] = []string{"/"}
		w.WriteHeader(http.StatusTemporaryRedirect)
	default:
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Auth action %s not supported", action)
	}
}
