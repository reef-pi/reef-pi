package utils

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gorilla/sessions"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func testAuthStore(t *testing.T, dbPath string, creds Credentials) (storage.Store, Auth) {
	t.Helper()
	os.Remove(dbPath)
	store, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	if err := store.CreateBucket("reef-pi"); err != nil {
		store.Close()
		os.Remove(dbPath)
		t.Fatal(err)
	}
	if err := store.Update("reef-pi", "credentials", creds); err != nil {
		store.Close()
		os.Remove(dbPath)
		t.Fatal(err)
	}
	a, err := NewAuth("reef-pi", store)
	if err != nil {
		store.Close()
		os.Remove(dbPath)
		t.Fatal(err)
	}
	return store, a
}

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
	store, a := testAuthStore(t, "auth-middleware-test.db", Credentials{User: "reef-pi", Password: "reef-pi"})
	defer func() { store.Close(); os.Remove("auth-middleware-test.db") }()

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

func TestAuthenticateAllowsSignedInSession(t *testing.T) {
	store, authHandler := testAuthStore(t, "auth-middleware-success-test.db", Credentials{User: "reef-pi", Password: "reef-pi"})
	defer func() { store.Close(); os.Remove("auth-middleware-success-test.db") }()

	a := authHandler.(*auth)
	req := httptest.NewRequest("GET", "/api/test", nil)
	rr := httptest.NewRecorder()
	session, err := a.cookiejar.Get(req, "auth")
	if err != nil {
		t.Fatal(err)
	}
	session.Values["user"] = "reef-pi"
	if err := session.Save(req, rr); err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("Cookie", rr.Header().Get("Set-Cookie"))
	rr = httptest.NewRecorder()
	called := false
	a.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		called = true
		w.WriteHeader(http.StatusAccepted)
	})(rr, req)

	if !called {
		t.Fatal("expected authenticated handler to run")
	}
	if rr.Code != http.StatusAccepted {
		t.Fatalf("expected status %d, got %d", http.StatusAccepted, rr.Code)
	}
}

func TestAuthenticateRejectsInvalidSessionCookie(t *testing.T) {
	store, a := testAuthStore(t, "auth-middleware-bad-cookie-test.db", Credentials{User: "reef-pi", Password: "reef-pi"})
	defer func() { store.Close(); os.Remove("auth-middleware-bad-cookie-test.db") }()

	req := httptest.NewRequest("GET", "/api/test", nil)
	req.AddCookie(&http.Cookie{Name: "auth", Value: "not-a-valid-session"})
	rr := httptest.NewRecorder()
	called := false

	a.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		called = true
	})(rr, req)

	if called {
		t.Fatal("handler should not be called for an invalid session cookie")
	}
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rr.Code)
	}
}

func TestSignInFailure(t *testing.T) {
	store, a := testAuthStore(t, "auth-signin-fail-test.db", Credentials{User: "reef-pi", Password: "reef-pi"})
	defer func() { store.Close(); os.Remove("auth-signin-fail-test.db") }()

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
	store, a := testAuthStore(t, "auth-signin-empty-test.db", Credentials{User: "reef-pi", Password: "reef-pi"})
	defer func() { store.Close(); os.Remove("auth-signin-empty-test.db") }()

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

func TestSignInInvalidJSON(t *testing.T) {
	store, a := testAuthStore(t, "auth-signin-invalid-json-test.db", Credentials{User: "reef-pi", Password: "reef-pi"})
	defer func() { store.Close(); os.Remove("auth-signin-invalid-json-test.db") }()

	req := httptest.NewRequest("POST", "/sign_in", bytes.NewBufferString("{"))
	rr := httptest.NewRecorder()
	a.SignIn(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rr.Code)
	}
}

func TestSignInAlreadyLoggedIn(t *testing.T) {
	store, authHandler := testAuthStore(t, "auth-signin-existing-session-test.db", Credentials{User: "reef-pi", Password: "reef-pi"})
	defer func() { store.Close(); os.Remove("auth-signin-existing-session-test.db") }()

	a := authHandler.(*auth)
	req := httptest.NewRequest("POST", "/sign_in", bytes.NewBufferString(`{"user":"reef-pi","password":"reef-pi"}`))
	rr := httptest.NewRecorder()
	session, err := a.cookiejar.Get(req, "auth")
	if err != nil {
		t.Fatal(err)
	}
	session.Values["user"] = "reef-pi"
	if err := session.Save(req, rr); err != nil {
		t.Fatal(err)
	}

	req = httptest.NewRequest("POST", "/sign_in", bytes.NewBufferString(`{"user":"reef-pi","password":"reef-pi"}`))
	req.Header.Set("Cookie", rr.Header().Get("Set-Cookie"))
	rr = httptest.NewRecorder()
	a.SignIn(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
	var payload interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &payload); err != nil {
		t.Fatalf("expected json response, got %q: %v", rr.Body.String(), err)
	}
}

func TestSignInCredentialsLookupError(t *testing.T) {
	store, err := storage.NewStore("auth-signin-lookup-error-test.db")
	if err != nil {
		t.Fatal(err)
	}
	defer func() { store.Close(); os.Remove("auth-signin-lookup-error-test.db") }()
	a := &auth{
		credentialsManager: NewCredentialsManager(store, "missing-bucket"),
		cookiejar:          sessions.NewCookieStore([]byte("reef-pi-key")),
	}

	req := httptest.NewRequest("POST", "/sign_in", bytes.NewBufferString(`{"user":"reef-pi","password":"reef-pi"}`))
	rr := httptest.NewRecorder()
	a.SignIn(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, rr.Code)
	}
}

func TestNewAuthReturnsDefaultCredentialsError(t *testing.T) {
	store, err := storage.NewStore("auth-default-error-test.db")
	if err != nil {
		t.Fatal(err)
	}
	defer func() { store.Close(); os.Remove("auth-default-error-test.db") }()

	if _, err := NewAuth("missing-bucket", store); err == nil {
		t.Fatal("expected NewAuth to fail when default credentials cannot be saved")
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
