package webui

import (
	"fmt"
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/objx"
	"log"
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
			errorResponse(http.StatusInternalServerError, fmt.Sprintf("Auth action %s not supported", action), w)
			return
		}

		loginURL, err := provider.GetBeginAuthURL(nil, nil)
		if err != nil {
			errorResponse(http.StatusInternalServerError, err.Error(), w)
			return
		}

		w.Header().Set("Location", loginURL)
		w.WriteHeader(http.StatusTemporaryRedirect)
	case "callback":
		provider, err := gomniauth.Provider(segs[3])
		if err != nil {
			errorResponse(http.StatusInternalServerError, err.Error(), w)
			return
		}
		creds, err := provider.CompleteAuth(objx.MustFromURLQuery(r.URL.RawQuery))
		if err != nil {
			errorResponse(http.StatusForbidden, err.Error(), w)
			return
		}
		user, err := provider.GetUser(creds)
		if err != nil {
			errorResponse(http.StatusForbidden, err.Error(), w)
			return
		}
		parts := strings.Split(user.Email(), "@")
		// externalize config
		if parts[1] != s.config.Domain {
			errorResponse(http.StatusForbidden, "Unauthorized domain", w)
			return
		}
		found := false
		log.Println("User: ", parts[0])
		for _, u := range s.config.Users {
			log.Println("Valid user: ", u)
			if u == parts[0] {
				found = true
				break
			}
		}
		if !found {
			errorResponse(http.StatusForbidden, "Not a valid user", w)
			return
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
