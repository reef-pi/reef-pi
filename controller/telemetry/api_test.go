package telemetry

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestAPI(t *testing.T) {
	tr := utils.NewTestRouter()
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	store.CreateBucket("telemetry")
	store.Update("telemetry", DBKey, DefaultTelemetryConfig)
	tele := TestTelemetry(store)
	tr.Router.Get("/api/telemetry", tele.GetConfig)
	tr.Router.Post("/api/telemetry", tele.UpdateConfig)
	tr.Router.Post("/api/telemetry/test_message", tele.SendTestMessage)
	body := new(bytes.Buffer)
	if err := tr.Do("GET", "/api/telemetry", body, nil); err != nil {
		t.Fatal("Failed to config using api. Error:", err)
	}
	enc := json.NewEncoder(body)
	enc.Encode(&DefaultTelemetryConfig)
	if err := tr.Do("POST", "/api/telemetry", body, nil); err != nil {
		t.Fatal("Failed to config using api. Error:", err)
	}
	body.Reset()
	if err := tr.Do("POST", "/api/telemetry/test_message", body, nil); err != nil {
		t.Fatal("Failed to config using api. Error:", err)
	}
}

func TestDeleteFeedIfExist(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	tele := TestTelemetry(store)
	// AdafruitIO disabled (default) — should be a no-op
	tele.DeleteFeedIfExist("test-feed")
}

func TestConfigAPIRedactsAndPreservesSecrets(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	store.CreateBucket("telemetry")

	original := DefaultTelemetryConfig
	original.AdafruitIO.Token = "aio-token"
	original.Mailer.Password = "mail-password"
	if err := store.Update("telemetry", DBKey, original); err != nil {
		t.Fatal(err)
	}

	tele := TestTelemetry(store)

	req := httptest.NewRequest(http.MethodGet, "/api/telemetry", nil)
	w := httptest.NewRecorder()
	tele.GetConfig(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected get config status 200, got %d: %s", w.Code, w.Body.String())
	}
	var redacted TelemetryConfig
	if err := json.NewDecoder(w.Body).Decode(&redacted); err != nil {
		t.Fatal(err)
	}
	if redacted.AdafruitIO.Token != AdafruitIOTokenStoredPlaceholder {
		t.Fatalf("expected redacted AIO token, got %q", redacted.AdafruitIO.Token)
	}
	if redacted.Mailer.Password != PasswordStoredPlaceholder {
		t.Fatalf("expected redacted mail password, got %q", redacted.Mailer.Password)
	}

	body := new(bytes.Buffer)
	body.Reset()
	redacted.Notify = false
	if err := json.NewEncoder(body).Encode(redacted); err != nil {
		t.Fatal(err)
	}
	req = httptest.NewRequest(http.MethodPost, "/api/telemetry", body)
	w = httptest.NewRecorder()
	tele.UpdateConfig(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected update config status 200, got %d: %s", w.Code, w.Body.String())
	}

	var saved TelemetryConfig
	if err := store.Get("telemetry", DBKey, &saved); err != nil {
		t.Fatal(err)
	}
	if saved.AdafruitIO.Token != original.AdafruitIO.Token {
		t.Fatalf("expected stored AIO token to be preserved, got %q", saved.AdafruitIO.Token)
	}
	if saved.Mailer.Password != original.Mailer.Password {
		t.Fatalf("expected stored mail password to be preserved, got %q", saved.Mailer.Password)
	}
}
