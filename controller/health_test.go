package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestHealthChecker(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Error(err)
	}
	telemetry := utils.TestTelemetry()
	h := NewHealthChecker(1, HealthCheckNotify{}, telemetry, store)
	h.Notify.Enable = true
	h.check()
}
