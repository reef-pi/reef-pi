package doser

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
)

type Runner struct {
	pin      int
	duration time.Duration
	speed    int
	vv       utils.VariableVoltage
}

func (r *Runner) Run() {
	log.Println("doser sub system: setting pwm pin:", r.pin, "at speed", r.speed)
	r.vv.Set(r.pin, r.speed)
	select {
	case <-time.After(r.duration * time.Second):
		r.vv.Set(r.pin, 0)
		log.Println("doser sub system: setting pwm pin:", r.pin, "at speed", 0)
	}
}
