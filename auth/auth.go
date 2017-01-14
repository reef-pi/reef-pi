package auth

import (
	"encoding/json"
	"log"
	"net/http"
)

func Check(next http.Handler) http.Handler {
	return &CheckHandler{next: next}
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
