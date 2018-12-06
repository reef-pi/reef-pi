package controller

import (
	"bytes"
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestAuth(t *testing.T) {
	r, err := New("1.0", "test.db")
	if err != nil {
		t.Error(err)
	}
	tr := utils.NewTestRouter()
	tr.Router.HandleFunc("/sign_in", r.SignIn).Methods("GET")
	tr.Router.HandleFunc("/sign_out", r.SignOut).Methods("GET")
	tr.Router.HandleFunc("/creds", r.UpdateCredentials).Methods("POST")
	tr.Router.HandleFunc("/me", r.Me).Methods("GET")
	body := new(bytes.Buffer)
	body.Write([]byte("{}"))
	if err := tr.Do("GET", "/sign_in", body, nil); err != nil {
		t.Error("Failed to sign in:", err)
	}
	body.Reset()
	body.Write([]byte("{}"))
	if err := tr.Do("GET", "/sign_out", body, nil); err != nil {
		t.Error("Failed to sign out:", err)
	}

	body.Reset()
	body.Write([]byte("{}"))
	if err := tr.Do("POST", "/creds", body, nil); err != nil {
		t.Error("Failed to update creds:", err)
	}

	body.Reset()
	body.Write([]byte("{}"))
	if err := tr.Do("GET", "/me", body, nil); err != nil {
		t.Error("Failed to hit /me:", err)
	}
}
