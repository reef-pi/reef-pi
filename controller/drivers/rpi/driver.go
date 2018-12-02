package rpi

import (
	"fmt"

	"github.com/kidoman/embd"
	"github.com/pkg/errors"
	"github.com/reef-pi/reef-pi/controller/drivers"
)

type rpiDriver struct {
	pins []*rpiPin
}

func (r *rpiDriver) Metadata() drivers.Metadata {

	return drivers.Metadata{
		Name:        "rpi",
		Description: "hardware peripherals and GPIO pins on the base raspberry pi hardware",
		Capabilities: drivers.Capabilities{
			Input:  true,
			Output: true,
			PWM:    true,
		},
	}
}

func NewRPiDriver() (drivers.Driver, error) {
	var pins []*rpiPin

	for pin := range validGPIOPins {
		digitalPin, err := embd.NewDigitalPin(pin)

		if err != nil {
			return nil, errors.Wrapf(err, "can't build rpi pin %d", pin)
		}

		pin := rpiPin{
			name:       fmt.Sprintf("GP%d", pin),
			pin:        pin,
			digitalPin: digitalPin,
		}
		pins = append(pins, &pin)
	}
	return &rpiDriver{
		pins: pins,
	}, nil
}
