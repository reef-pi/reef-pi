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
	if err := r.jacks.DirectControl("rpi", r.pin, r.speed); err != nil {
		log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		return
	}
	select {
	case <-time.After(r.duration * time.Second):
		log.Println("doser sub system: setting pwm pin:", r.pin, "at speed", 0)
		if err := r.jacks.DirectControl("rpi", r.pin, 0); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		}
	}
}
