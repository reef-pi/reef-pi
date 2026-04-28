package daemon

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type apiLoadCountingSubsystem struct {
	loadCount int
}

func (s *apiLoadCountingSubsystem) Setup() error          { return nil }
func (s *apiLoadCountingSubsystem) LoadAPI(r *mux.Router) { s.loadCount++ }
func (s *apiLoadCountingSubsystem) Start()                {}
func (s *apiLoadCountingSubsystem) Stop()                 {}
func (s *apiLoadCountingSubsystem) On(string, bool) error { return nil }
func (s *apiLoadCountingSubsystem) InUse(string, string) ([]string, error) {
	return nil, nil
}
func (s *apiLoadCountingSubsystem) GetEntity(string) (controller.Entity, error) {
	return nil, nil
}

func newHTTPCompositionTestReefPi(t *testing.T) *ReefPi {
	t.Helper()

	store, err := storage.NewStore(filepath.Join(t.TempDir(), "reef-pi.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Error(err)
		}
	})
	if err := store.CreateBucket(Bucket); err != nil {
		t.Fatal(err)
	}

	tele := telemetry.TestTelemetry(store)
	auth, err := utils.NewAuth(Bucket, store)
	if err != nil {
		t.Fatal(err)
	}
	s := settings.DefaultSettings
	return &ReefPi{
		a:          auth,
		store:      store,
		settings:   s,
		telemetry:  tele,
		dm:         device_manager.New(s, store, tele),
		subsystems: controller.NewSubsystemComposite(),
	}
}

func TestAuthenticatedAPILoadsSubsystemRoutesOnce(t *testing.T) {
	r := newHTTPCompositionTestReefPi(t)
	subsystem := &apiLoadCountingSubsystem{}
	r.subsystems.Load("test-subsystem", subsystem)

	r.AuthenticatedAPI(mux.NewRouter())

	if subsystem.loadCount != 1 {
		t.Fatalf("expected subsystem API to load once, got %d", subsystem.loadCount)
	}
}

func TestServerHandlerComposesStaticAuthCORSAndPrometheus(t *testing.T) {
	r := newHTTPCompositionTestReefPi(t)
	r.settings.CORS = true
	r.settings.Prometheus = true

	root := t.TempDir()
	for _, dir := range []string{"ui/assets", "images"} {
		if err := os.MkdirAll(filepath.Join(root, dir), 0755); err != nil {
			t.Fatal(err)
		}
	}
	files := map[string]string{
		"ui/home.html":     "home",
		"ui/favicon.ico":   "icon",
		"ui/assets/app.js": "asset",
		"images/test.txt":  "image",
	}
	for name, content := range files {
		if err := os.WriteFile(filepath.Join(root, name), []byte(content), 0644); err != nil {
			t.Fatal(err)
		}
	}
	wd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(root); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := os.Chdir(wd); err != nil {
			t.Error(err)
		}
	})

	handler := r.serverHandler()
	assertHTTPStatus(t, handler, "GET", "/", nil, http.StatusOK)
	assertHTTPStatus(t, handler, "GET", "/assets/app.js", nil, http.StatusOK)
	assertHTTPStatus(t, handler, "GET", "/images/test.txt", nil, http.StatusOK)
	assertHTTPStatus(t, handler, "GET", "/api/me", nil, http.StatusUnauthorized)
	assertHTTPStatus(t, handler, "GET", "/x/metrics", nil, http.StatusOK)

	signInBody := bytes.NewBufferString(`{"user":"reef-pi","password":"reef-pi"}`)
	signIn := httptest.NewRecorder()
	handler.ServeHTTP(signIn, httptest.NewRequest("POST", "/auth/signin", signInBody))
	if signIn.Code != http.StatusOK {
		t.Fatalf("expected signin status %d, got %d: %s", http.StatusOK, signIn.Code, signIn.Body.String())
	}

	meRequest := httptest.NewRequest("GET", "/api/me", nil)
	for _, cookie := range signIn.Result().Cookies() {
		meRequest.AddCookie(cookie)
	}
	me := httptest.NewRecorder()
	handler.ServeHTTP(me, meRequest)
	if me.Code != http.StatusOK {
		t.Fatalf("expected authenticated API status %d, got %d: %s", http.StatusOK, me.Code, me.Body.String())
	}
	if got := me.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Fatalf("expected CORS origin header '*', got %q", got)
	}
}

func assertHTTPStatus(t *testing.T, handler http.Handler, method, path string, body *bytes.Buffer, expected int) {
	t.Helper()

	var requestBody *bytes.Buffer
	if body == nil {
		requestBody = new(bytes.Buffer)
	} else {
		requestBody = body
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(method, path, requestBody))
	if response.Code != expected {
		t.Fatalf("expected %s %s status %d, got %d: %s", method, path, expected, response.Code, response.Body.String())
	}
}

func TestAPI(t *testing.T) {
	const dbFile = "api-test.db"
	os.Remove(dbFile)
	store, err := storage.NewStore(dbFile)
	if store != nil {
		defer func() {
			store.Close()
			os.Remove(dbFile)
		}()
	}

	if err != nil {
		t.Fatal(err)
	}
	initializeSettings(store)
	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	if err := store.Update(Bucket, "settings", s); err != nil {
		t.Fatal(err)
	}
	store.Close()

	r, err := New("0.1", "api-test.db")
	if err != nil {
		t.Fatal("Failed to create new reef-pi controller. Error:", err)
	}
	r.settings.Capabilities.DevMode = true
	if err := r.Start(); err != nil {
		t.Fatal("Failed to load subsystem. Error:", err)
	}
	tr := utils.NewTestRouter()

	r.UnAuthenticatedAPI(tr.Router)
	r.AuthenticatedAPI(tr.Router)
	r.h.Check()
	if err := tr.Do("GET", "/api/health_stats", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get per minute health data.Error:", err)
	}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(utils.Credentials{
		User:     "reef-pi",
		Password: "reef-pi",
	})
	if err := tr.Do("POST", "/api/credentials", body, nil); err != nil {
		t.Error("Failed to update creds via api")
	}
	if err := tr.Do("GET", "/api/settings", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get settings via api")
	}
	body.Reset()
	json.NewEncoder(body).Encode(&settings.DefaultSettings)
	if err := tr.Do("POST", "/api/settings", body, nil); err != nil {
		t.Error("Failed to update settings via api")
	}
	if err := tr.Do("GET", "/api/settings", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get settings via api")
	}
	body.Reset()
	json.NewEncoder(body).Encode(&telemetry.DefaultTelemetryConfig)
	if err := tr.Do("POST", "/api/telemetry", body, nil); err != nil {
		t.Error("Failed to update telemetry via api")
	}
	if err := tr.Do("GET", "/api/telemetry", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get telemetry via api")
	}
	body.Reset()
	json.NewEncoder(body).Encode(&DefaultDashboard)
	if err := tr.Do("POST", "/api/dashboard", body, nil); err != nil {
		t.Error("Failed to update dashboard via api")
	}
	if err := tr.Do("GET", "/api/dashboard", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get dashboard via api")
	}
	if err := r.LogError("test-error", "test message"); err != nil {
		t.Error(err)
	}
	if err := r.LogError("test-error-2", "test message"); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/errors/test-error", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to list errors using api. Error:", err)
	}
	if err := tr.Do("DELETE", "/api/errors/test-error", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to delete individual error using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/errors", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to list errors using api. Error:", err)
	}
	if err := tr.Do("DELETE", "/api/errors/clear", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to clear errors using api. Error:", err)
	}
	if err := tr.Do("POST", "/api/dev/smoke/reset", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to reset smoke state using api. Error:", err)
	}
	if err := tr.Do("POST", "/api/telemetry/test_message", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to send test message using api. Error:", err)
	}
	if err := r.Stop(); err != nil {
		t.Error(err)
	}
}
