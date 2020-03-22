package telemetry

import (
	"github.com/reef-pi/reef-pi/controller/storage"
	"testing"
)

func TestEmitMetric(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	tele := TestTelemetry(store)
	tele.EmitMetric("test", "foo", 1.23)
	tele.config.Throttle = 2
	sent, err := tele.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if !sent {
		t.Error("Test alert not sent")
	}
	sent, err = tele.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if !sent {
		t.Error("Test alert not sent")
	}
	sent, err = tele.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if sent {
		t.Error("Test alert not being throttled")
	}
}
