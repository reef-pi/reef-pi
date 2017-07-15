package utils

import (
	"github.com/kidoman/embd"
	"log"
)

func SwitchOn(pinNumber int) error {
	return setGPIO(pinNumber, embd.High)
}

func SwitchOff(pinNumber int) error {
	return setGPIO(pinNumber, embd.Low)
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

func ReadGPIO(pinNumber int) (int, error) {
	pin, err := embd.NewDigitalPin(pinNumber)
	if err != nil {
		return -1, err
	}
	if err := pin.SetDirection(embd.In); err != nil {
		return -1, err
	}
	return pin.Read()
}
