package telemetry

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestHealthChecker(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()

	if err != nil {
		t.Error(err)
	}
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
