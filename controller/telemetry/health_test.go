package telemetry

import (
	"net/http/httptest"
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestHealthChecker(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Error(err)
	}
	defer store.Close()

	c := settings.HealthCheckNotify{
		Enable:    true,
		MaxMemory: 100,
		MaxCPU:    100,
	}
	h := NewHealthChecker("reef-pi", 1, c, TestTelemetry(store), store)
	h.Check()
	go h.Start()
	h.Stop()
}

func TestHealthCheckerGetStats(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	c := settings.HealthCheckNotify{Enable: false}
	h := NewHealthChecker("reef-pi", 1, c, TestTelemetry(store), store)
	h.Check() // populate stats

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/health", nil)
	h.GetStats(w, req)
	if w.Code != 200 {
		t.Errorf("GetStats returned status %d, want 200", w.Code)
	}
}

func TestNotifyIfNeeded(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	c := settings.HealthCheckNotify{
		Enable:    true,
		MaxMemory: 50,
		MaxCPU:    50,
	}
	checker := NewHealthChecker("reef-pi", 1, c, TestTelemetry(store), store).(*hc)

	// Both memory and load above threshold — should trigger both notifications
	checker.NotifyIfNeeded(90, 90)

	// Both below threshold — should be no-op
	checker.NotifyIfNeeded(10, 10)

	// Notify disabled — should be no-op even if over threshold
	checker.Notify.Enable = false
	checker.NotifyIfNeeded(90, 90)
}
