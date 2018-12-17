package timer

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func TestReminderRunner(t *testing.T) {
	tele := telemetry.TestTelemetry()
	r := ReminderRunner{
		t:     tele,
		title: "Test title",
		body:  "test body",
	}
	r.Run()
}
