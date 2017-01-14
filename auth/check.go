package auth

import (
	"log"
	"net/http"
)

type CheckHandler struct {
	next http.Handler
}

func (h *CheckHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if _, err := r.Cookie("auth"); err == http.ErrNoCookie {
		http.Redirect(w, r, "/login", 301)
		log.Println("Not authenticated")
	} else if err != nil {
		http.Redirect(w, r, "/login", 301)
		log.Println("ERROR: Auth:", err)
	} else {
		h.next.ServeHTTP(w, r)
	}
}
