package doser

import (
	"github.com/reef-pi/reef-pi/controller/connectors"
	"log"
	"time"
)

type Runner struct {
	pin      int
	jack     string
	duration time.Duration
	speed    int
	jacks    *connectors.Jacks
}

func (r *Runner) Run() {
	v := make(map[int]int)
	v[r.pin] = r.speed

	log.Println("doser sub system: setting pwm pin:", r.pin, "at speed", r.speed)
	if err := r.jacks.Control(r.jack, v); err != nil {
		log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		return
	}
	select {
	case <-time.After(r.duration * time.Second):
		v[r.pin] = 0
		log.Println("doser sub system: setting pwm pin:", r.pin, "at speed", 0)
		if err := r.jacks.Control(r.jack, v); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		}
	}
}
