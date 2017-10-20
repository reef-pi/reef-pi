package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

type Credentials struct {
	User     string `json:"user"`
	Password string `json:"password"`
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
