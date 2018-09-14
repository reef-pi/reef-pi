// +build windows

package utils

import (
	"log"
)

func InitGPIO() error {
	log.Println("Init GPIO")
	return nil
}

func CloseGPIO() error {
	log.Println("Close GPIO")
	return nil
}

func SwitchOn(pinNumber int) error {
	log.Println("Setting GPIO Pin:", pinNumber, "State:", 1)
	return nil
}

func SwitchOff(pinNumber int) error {
	log.Println("Setting GPIO Pin:", pinNumber, "State:", 0)
	return nil
}

func setGPIO(pinNumber int, state int) error {
	log.Println("Setting GPIO Pin:", pinNumber, "State:", state)
	return nil
}

func ReadGPIO(pinNumber int) (int, error) {
	log.Println("Reading GPIO Pin:", pinNumber)
	return 1, nil
}
