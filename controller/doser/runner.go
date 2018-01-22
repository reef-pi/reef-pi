package doser

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"time"
)

type Runner struct {
	pin      int
	duration time.Duration
	speed    int
	vv       utils.VariableVoltage
}

func (r *Runner) Run() {
	r.vv.Set(r.pin, r.speed)
	select {
	case <-time.After(r.duration * time.Second):
		r.vv.Set(r.pin, 0)
	}
}
