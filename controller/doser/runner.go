package doser

import (
	"time"
)

type Runner struct {
	pin      int
	duration time.Duration
	speed    int
}

func (r *Runner) Run() {
	// TODO set pwm speed and switch on pin
	select {
	case <-time.After(r.duration * time.Second):
		// TODO set pwm speed to 0 and switch off
	}
}
