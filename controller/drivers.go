package controller

import (
	"github.com/kidoman/embd"
	_ "github.com/kidoman/embd/host/rpi"
	"log"
)

func (c *Controller) doSwitching(pinNumber int, on bool) error {
	pin, err := embd.NewDigitalPin(pinNumber)
	if err != nil {
		return err
	}
	if err := pin.SetDirection(embd.Out); err != nil {
		return err
	}
	state := embd.High // default state is high
	if on {
		if c.highRelay { // A high relay uses High GPIO for close state
			state = embd.Low
		}
	} else {
		if !c.highRelay {
			state = embd.Low
		}
	}
	log.Println("Setting GPIO Pin:", pinNumber, "State:", state)
	return pin.Write(state)
}

func (c *Controller) doPWM(pinNumber int, on bool, value int) error {
	log.Println("Setting PWM Pin:", pinNumber, "State:", on, "Value:", value)
	if !on {
		return c.pwm.Off(pinNumber)
	}
	return c.pwm.Set(pinNumber, value)
}
