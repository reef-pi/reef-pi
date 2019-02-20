package daemon

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/reef-pi/reef-pi/controller/utils"
)

type Credentials struct {
	User     string `json:"user"`
	Password string `json:"password"`
}

func (r *ReefPi) BasicAuth(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		authSession, err := r.cookiejar.Get(req, "auth")
		if err != nil {
			log.Println("unauthorized request.", req.RemoteAddr, "error:", err)
			http.Error(w, "Unauthorized.", 401)
			return
		}
		if user := authSession.Values["user"]; user == nil {
			log.Println("unauthorized request. user is not set.", req.RemoteAddr)
			http.Error(w, "Unauthorized.", 401)
			return
		}
		authSession.Save(req, w)
		log.Printf("API Request:'%6s %s' from: %s\n", req.Method, req.URL.String(), req.RemoteAddr)
		fn(w, req)
	}
}

func (r *ReefPi) Me(w http.ResponseWriter, req *http.Request) {
	utils.JSONResponse("you?", w, req)
}

func (r *ReefPi) SignIn(w http.ResponseWriter, req *http.Request) {
	var reqCredentials Credentials
	var bucketCredentials Credentials
	if req.Body == nil {
		http.Error(w, "No body request", 400)
		return
	}
	if err := json.NewDecoder(req.Body).Decode(&reqCredentials); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	session, _ := r.cookiejar.Get(req, "auth")
	if session.Values["user"] == reqCredentials.User {
		log.Println("Already logged in.", req.RemoteAddr)
		utils.JSONResponse(nil, w, req)
		return
	}
	r.store.Get(Bucket, "credentials", &bucketCredentials)
	if reqCredentials.User == bucketCredentials.User && reqCredentials.Password == bucketCredentials.Password {
		log.Println("Access granted for:", req.RemoteAddr)
		session.Values["user"] = reqCredentials.User
		session.Save(req, w)
		utils.JSONResponse(nil, w, req)
		return
	}
	log.Println("DEBUG:", "Access Denied for", req.RemoteAddr)
	w.WriteHeader(401)
	utils.JSONResponse(nil, w, req)
}

func (r *ReefPi) SignOut(w http.ResponseWriter, req *http.Request) {
	session, _ := r.cookiejar.Get(req, "auth")
	defer session.Save(req, w)
	session.Options.MaxAge = -1
	log.Println("Sign out:", req.RemoteAddr)
}

func (r *ReefPi) GetCredentials() (Credentials, error) {
	var c Credentials
	return c, r.store.Get(Bucket, "credentials", &c)
}

func (r *ReefPi) UpdateCredentials(w http.ResponseWriter, req *http.Request) {
	var creds Credentials
	fn := func(_ string) error {
		return r.store.Update(Bucket, "credentials", creds)
	}
	utils.JSONUpdateResponse(&creds, fn, w, req)
}
