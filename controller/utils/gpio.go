package utils

import (
	"github.com/kidoman/embd"
	"log"
)

func SwitchOn(pinNumber int, pullUp bool) error {
	state := embd.High
	if pullUp {
		state = embd.Low
	}
	return setGPIO(pinNumber, state)
}

func SwitchOff(pinNumber int, pullUp bool) error {
	state := embd.Low
	if pullUp {
		state = embd.High
	}
	return setGPIO(pinNumber, state)
}

func setGPIO(pinNumber int, state int) error {
	log.Println("Setting GPIO Pin:", pinNumber, "State:", state)
	pin, err := embd.NewDigitalPin(pinNumber)
	if err != nil {
		return err
	}
	if err := pin.SetDirection(embd.Out); err != nil {
		return err
	}
	return pin.Write(state)
}
