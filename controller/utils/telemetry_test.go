package utils

import (
	"math/rand"
	"testing"
	"time"
)

func TestEmitMetric(t *testing.T) {
	telemetry := TestTelemetry()
	rand.Seed(time.Now().Unix())
	telemetry.EmitMetric("test", rand.Intn(100))
	telemetry.config.Throttle = 2
	sent, err := telemetry.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if !sent {
		t.Error("Test alert not sent")
	}
	sent, err = telemetry.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if !sent {
		t.Error("Test alert not sent")
	}
	sent, err = telemetry.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if sent {
		t.Error("Test alert not being throttled")
	}
}
