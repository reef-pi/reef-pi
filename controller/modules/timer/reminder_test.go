package timer

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func TestReminderRunner(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()

	if err != nil {
		t.Fatal(store)
	}
	tele := telemetry.TestTelemetry(store)
	r := ReminderRunner{
		t:     tele,
		title: "Test title",
		body:  "test body",
	}
	r.Run()
}
