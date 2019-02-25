package telemetry

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestHealthChecker(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Error(err)
	}
	h := NewHealthChecker("reef-pi", 1, settings.HealthCheckNotify{}, TestTelemetry(), store)
	h.Check()
}
