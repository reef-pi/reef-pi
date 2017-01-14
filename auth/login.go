package auth

import (
	"github.com/stretchr/objx"
	"log"
	"net/http"
	"strings"
)

func (a *Auth) LoginHandler(w http.ResponseWriter, r *http.Request) {
	loginURL, err := a.provider.GetBeginAuthURL(nil, nil)
	if err != nil {
		errorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}

	w.Header().Set("Location", loginURL)
	w.WriteHeader(http.StatusTemporaryRedirect)
}

func (a *Auth) CallbackHandler(w http.ResponseWriter, r *http.Request) {
	creds, err := a.provider.CompleteAuth(objx.MustFromURLQuery(r.URL.RawQuery))
	if err != nil {
		errorResponse(http.StatusForbidden, err.Error(), w)
		return
	}
	user, err := a.provider.GetUser(creds)
	if err != nil {
		errorResponse(http.StatusForbidden, err.Error(), w)
		return
	}
	parts := strings.Split(user.Email(), "@")
	// externalize config
	if parts[1] != a.config.Domain {
		errorResponse(http.StatusForbidden, "Unauthorized domain", w)
		return
	}
	found := false
	log.Println("User: ", parts[0])
	for _, u := range a.config.Users {
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
}
