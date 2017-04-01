package controller

import (
	"github.com/kidoman/embd"
	"log"
)

func (c *Controller) doSwitching(pinNumber int, on bool) error {
	state := embd.High // default state is high
	if on {
		if c.config.HighRelay { // A high relay uses High GPIO for close state
			state = embd.Low
		}
	} else {
		if !c.config.HighRelay {
			state = embd.Low
		}
	}
	log.Println("Setting GPIO Pin:", pinNumber, "On:", on, "State:", state)
	if !c.config.EnableGPIO {
		log.Printf("GPIO is disabled. Skipping\n")
		return nil
	}
	pin, err := embd.NewDigitalPin(pinNumber)
	if err != nil {
		return err
	}
	if err := pin.SetDirection(embd.Out); err != nil {
		return err
	}
	return pin.Write(state)
}

func (c *Controller) doPWM(pinNumber int, on bool, value int) error {
	log.Println("Setting PWM Pin:", pinNumber, "On:", on, "Value:", value)
	if !c.config.EnablePWM {
		log.Printf("PWM is disabled. Skipping\n")
		return nil
	}
	if !on {
		return c.state.pwm.Off(pinNumber)
	}
	return c.state.pwm.Set(pinNumber, value)
}
