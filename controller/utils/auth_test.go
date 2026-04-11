package utils

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestAuthDefaultCredentials(t *testing.T) {
	dbPath := "auth-default-test.db"
	os.Remove(dbPath)
	store, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		store.Close()
		os.Remove(dbPath)
	}()
	// Create bucket but no credentials — NewAuth should call defaultCredentials
	store.CreateBucket("reef-pi")
	_, err = NewAuth("reef-pi", store)
	if err != nil {
		t.Fatal("Expected NewAuth to succeed with default credentials, got:", err)
	}
}

func TestAuthenticate(t *testing.T) {
	dbPath := "auth-middleware-test.db"
	os.Remove(dbPath)
	store, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { store.Close(); os.Remove(dbPath) }()
	store.CreateBucket("reef-pi")
	store.Update("reef-pi", "credentials", Credentials{User: "reef-pi", Password: "reef-pi"})
	a, err := NewAuth("reef-pi", store)
	if err != nil {
		t.Fatal(err)
	}

	called := false
	handler := a.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})

	// Request without a session cookie should be rejected with 401
	req := httptest.NewRequest("GET", "/api/test", nil)
	rr := httptest.NewRecorder()
	handler(rr, req)
	if rr.Code != 401 {
		t.Errorf("Expected 401 for unauthenticated request, got %d", rr.Code)
	}
	if called {
		t.Error("Handler should not have been called for unauthenticated request")
	}
}

func TestSignInFailure(t *testing.T) {
	dbPath := "auth-signin-fail-test.db"
	os.Remove(dbPath)
	store, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { store.Close(); os.Remove(dbPath) }()
	store.CreateBucket("reef-pi")
	store.Update("reef-pi", "credentials", Credentials{User: "reef-pi", Password: "reef-pi"})
	a, err := NewAuth("reef-pi", store)
	if err != nil {
		t.Fatal(err)
	}

	tr := NewTestRouter()
	tr.Router.HandleFunc("/sign_in", a.SignIn).Methods("POST")

	// Wrong password — should not succeed
	body := new(bytes.Buffer)
	body.Write([]byte(`{"user":"reef-pi", "password":"wrongpassword"}`))
	req := httptest.NewRequest("POST", "/sign_in", body)
	rr := httptest.NewRecorder()
	tr.Router.ServeHTTP(rr, req)
	if rr.Code == 200 {
		t.Error("Sign-in with wrong password should not return 200")
	}
}

func TestSignInEmptyBody(t *testing.T) {
	dbPath := "auth-signin-empty-test.db"
	os.Remove(dbPath)
	store, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { store.Close(); os.Remove(dbPath) }()
	store.CreateBucket("reef-pi")
	store.Update("reef-pi", "credentials", Credentials{User: "reef-pi", Password: "reef-pi"})
	a, err := NewAuth("reef-pi", store)
	if err != nil {
		t.Fatal(err)
	}

	tr := NewTestRouter()
	tr.Router.HandleFunc("/sign_in", a.SignIn).Methods("POST")

	// No body should return 400
	req := httptest.NewRequest("POST", "/sign_in", nil)
	rr := httptest.NewRecorder()
	tr.Router.ServeHTTP(rr, req)
	if rr.Code != 400 {
		t.Errorf("Sign-in with nil body should return 400, got %d", rr.Code)
	}
}

func TestAuth(t *testing.T) {
	dbPath := "auth-test.db"
	os.Remove(dbPath)
	store, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(dbPath)
	creds := Credentials{
		User:     "reef-pi",
		Password: "reef-pi",
	}
	store.CreateBucket("reef-pi")
	store.Update("reef-pi", "credentials", creds)
	r, err := NewAuth("reef-pi", store)
	if err != nil {
		t.Fatal(err)
	}
	tr := NewTestRouter()
	tr.Router.HandleFunc("/sign_in", r.SignIn).Methods("GET")
	tr.Router.HandleFunc("/sign_out", r.SignOut).Methods("GET")
	tr.Router.HandleFunc("/creds", r.UpdateCredentials).Methods("POST")
	tr.Router.HandleFunc("/me", r.Me).Methods("GET")
	body := new(bytes.Buffer)
	body.Write([]byte(`{"user":"reef-pi", "password":"reef-pi"}`))
	if err := tr.Do("GET", "/sign_in", body, nil); err != nil {
		t.Error("Failed to sign in:", err)
	}
	body.Reset()
	body.Write([]byte("{}"))
	if err := tr.Do("GET", "/sign_out", body, nil); err != nil {
		t.Error("Failed to sign out:", err)
	}

	body.Reset()
	body.Write([]byte(`{"user":"reef-pi", "password":"123456789"}`))
	if err := tr.Do("POST", "/creds", body, nil); err != nil {
		t.Error("Failed to update creds:", err)
	}

	body.Reset()
	body.Write([]byte("{}"))
	if err := tr.Do("GET", "/me", body, nil); err != nil {
		t.Error("Failed to hit /me:", err)
	}

	body.Reset()
	body.Write([]byte(`{"user":"reef-pi", "password":"123456789"}`))
	if err := tr.Do("GET", "/sign_in", body, nil); err != nil {
		t.Error("Failed to sign in after change credentials:", err)
	}
	store.Close()
}
