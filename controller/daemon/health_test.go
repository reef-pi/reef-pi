package daemon

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func TestHealthChecker(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Error(err)
	}
	telemetry := telemetry.TestTelemetry()
	h := NewHealthChecker(1, settings.HealthCheckNotify{}, telemetry, store)
	h.Notify.Enable = true
	h.check()
}
