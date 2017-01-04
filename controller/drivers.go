package controller

import (
	"fmt"
	"github.com/kidoman/embd"
	_ "github.com/kidoman/embd/host/rpi"
	"log"
)

func (c *Controller) doSwitching(pinNumber int, action string) error {
	pin, err := embd.NewDigitalPin(pinNumber)
	if err != nil {
		return err
	}
	defer pin.Close()
	if err := pin.SetDirection(embd.Out); err != nil {
		return err
	}
	state := embd.High // default state is high
	switch action {
	case "on":
		if c.highRelay { // A high relay uses High GPIO for close state
			state = embd.Low
		}
	case "off":
		if !c.highRelay {
			state = embd.Low
		}
	default:
		return fmt.Errorf("Unknown action: %s", action)
	}
	log.Println("Setting GPIO Pin:", pinNumber, "State:", state)
	return pin.Write(state)
}

func (c *Controller) doPWM(o Outlet, a OuteltAction) error {
	if a.Action == "off" {
		return c.pwm.Off(o.Pin)
	}
	return c.pwm.Set(o.Pin, a.Value)
}
