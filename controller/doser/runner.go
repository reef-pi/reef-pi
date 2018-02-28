package doser

import (
	"github.com/reef-pi/reef-pi/controller/connectors"
	"log"
	"time"
)

type Runner struct {
	pin      int
	duration time.Duration
	speed    int
	jacks    *connectors.Jacks
}

func (r *Runner) Run() {
	log.Println("doser sub system: setting pwm pin:", r.pin, "at speed", r.speed)
	r.jacks.DirectControl("rpi", r.pin, r.speed)
	select {
	case <-time.After(r.duration * time.Second):
		r.jacks.DirectControl("rpi", r.pin, 0)
		log.Println("doser sub system: setting pwm pin:", r.pin, "at speed", 0)
	}
}
