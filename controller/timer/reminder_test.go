package timer

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestReminderRunner(t *testing.T) {
	telemetry := utils.TestTelemetry()
	r := ReminderRunner{
		telemetry: telemetry,
		title:     "Test title",
		body:      "test body",
	}
	r.Run()
}
