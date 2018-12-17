package timer

import (
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Reminder struct {
	Title   string `json:"title"`
	Message string `json:"message"`
}

type ReminderRunner struct {
	t           telemetry.Telemetry
	title, body string
}

func (r ReminderRunner) Run() {
	r.t.Alert(r.title, r.body)
}
