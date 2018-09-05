package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
	"encoding/json"
	"log"
)

type Credentials struct {
	User     string `json:"user"`
	Password string `json:"password"`
}

func (r *ReefPi) SignIn(w http.ResponseWriter, req *http.Request) {
  var reqCredentials Credentials
  var bucketCredentials Credentials
  if req.Body == nil {
      log.Println("DEBUG:", "No Body")
      http.Error(w, "Please send a request body", 400)
      return
  }
  err := json.NewDecoder(req.Body).Decode(&reqCredentials)
  if err != nil {
      log.Println("DEBUG:", "Error while decoding")
      http.Error(w, err.Error(), 400)
      return
  }
  session, _ := r.cookiejar.Get(req, "auth")
  if session.Values["user"] == reqCredentials.User {
    log.Println("DEBUG:", "Already logged")
    utils.JSONResponse(nil, w, req)
	} else {
    err = r.store.Get(Bucket, "credentials", &bucketCredentials)
    if reqCredentials.User == bucketCredentials.User && reqCredentials.Password == bucketCredentials.Password {
      log.Println("DEBUG:", "Access Granted")
      session.Values["user"] = reqCredentials.User
      session.Save(req, w)
      utils.JSONResponse(nil, w, req)
    } else {
      log.Println("DEBUG:", "Access Denied")
      w.WriteHeader(401)
      utils.JSONResponse(nil, w, req)
    }
  }
}

func (r *ReefPi) SignOut(w http.ResponseWriter, req *http.Request) {
  session, _ := r.cookiejar.Get(req, "auth")
 	defer session.Save(req, w)
  session.Options.MaxAge = -1
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
