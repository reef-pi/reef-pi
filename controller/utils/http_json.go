package utils

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

type Doer interface {
	Do(func(interface{}))
}

func NewBasicAuth(user, pass string) *Auth {
	return &Auth{
		user: user,
		pass: pass,
	}
}

type Auth struct {
	user string
	pass string
}

func (a *Auth) check(user, pass string) bool {
	return (a.user == user) && (a.pass == pass)
}

func (a *Auth) BasicAuth(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, pass, _ := r.BasicAuth()
		if !a.check(user, pass) {
			http.Error(w, "Unauthorized.", 401)
			return
		}
		fn(w, r)
	}
}

func ErrorResponse(header int, msg string, w http.ResponseWriter) {
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

func JSONResponse(payload interface{}, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(payload); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}

func JSONGetResponse(fn func(string) (interface{}, error), w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	payload, err := fn(id)
	if err != nil {
		ErrorResponse(http.StatusNotFound, err.Error(), w)
		log.Println("ERROR: GET", r.RequestURI, err)
		return
	}
	JSONResponse(payload, w, r)
}

func JSONListResponse(fn func() (interface{}, error), w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	payload, err := fn()
	if err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to list", w)
		log.Println("ERROR: GET", r.RequestURI, err)
		return
	}
	JSONResponse(payload, w, r)
}

func JSONCreateResponse(i interface{}, fn func() error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(i); err != nil {
		ErrorResponse(http.StatusBadRequest, err.Error(), w)
		log.Println(i)
		return
	}
	if err := fn(); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to create. Error: "+err.Error(), w)
		return
	}
}

func JSONUpdateResponse(i interface{}, fn func(string) error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(i); err != nil {
		ErrorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := fn(id); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to update. Error: "+err.Error(), w)
		return
	}
}

func JSONDeleteResponse(fn func(string) error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	if err := fn(id); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to delete. Error: "+err.Error(), w)
		return
	}
}

func JSONGetUsage(usage Doer) http.HandlerFunc {
	handlerFn := func(w http.ResponseWriter, r *http.Request) {
		fn := func(id string) (interface{}, error) {
			arrayUsage := []interface{}{}
			usage.Do(func(i interface{}) {
				if i != nil {
					arrayUsage = append(arrayUsage, i)
				}
			})
			return arrayUsage, nil
		}
		JSONGetResponse(fn, w, r)
	}
	return handlerFn
}
