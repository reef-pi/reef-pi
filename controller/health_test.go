package controller

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestHealthChecker(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Error(err)
	}
	telemetry := utils.TestTelemetry()
	h := NewHealthChecker(1, settings.HealthCheckNotify{}, telemetry, store)
	h.Notify.Enable = true
	h.check()
}
