package timer

import (
	"github.com/reef-pi/reef-pi/controller/types"
)

type Reminder struct {
	Title   string `json:"title"`
	Message string `json:"message"`
}

type ReminderRunner struct {
	telemetry   types.Telemetry
	title, body string
}

func (r ReminderRunner) Run() {
	r.telemetry.Alert(r.title, r.body)
}
