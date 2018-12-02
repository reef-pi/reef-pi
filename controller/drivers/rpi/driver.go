package rpi

import (
	"fmt"

	"github.com/reef-pi/reef-pi/controller"
	pwmdriver "github.com/reef-pi/rpi/pwm"

	"github.com/kidoman/embd"
	"github.com/pkg/errors"
	"github.com/reef-pi/reef-pi/controller/drivers"
)

type rpiDriver struct {
	pins []*rpiPin
	pwm  *rpiPwm
}

func (r *rpiDriver) Metadata() drivers.Metadata {

	return drivers.Metadata{
		Name:        "rpi",
		Description: "hardware peripherals and GPIO channels on the base raspberry pi hardware",
		Capabilities: drivers.Capabilities{
			Input:  true,
			Output: true,
			PWM:    true,
		},
	}
}

func (r *rpiDriver) Close() error {
	for _, pin := range r.pins {
		err := pin.Close()
		if err != nil {
			return errors.Wrapf(err, "can't close rpi driver due to channel %s", pin.Name())
		}
	}
	return nil
}

func NewRPiDriver(s controller.Settings) (drivers.Driver, error) {
	var pins []*rpiPin

	for pin := range validGPIOPins {
		digitalPin, err := embd.NewDigitalPin(pin)

		if err != nil {
			return nil, errors.Wrapf(err, "can't build rpi channel %d", pin)
		}

		pin := rpiPin{
			name:       fmt.Sprintf("GP%d", pin),
			pin:        pin,
			digitalPin: digitalPin,
		}
		pins = append(pins, &pin)
	}

	pwm := &rpiPwm{
		driver:    pwmdriver.New(),
		frequency: s.RPI_PWMFreq * 100000,
	}
	for _, pin := range []int{1, 2} {
		pwmPin := &rpiPwmChannel{
			channel: pin,
		}
		pwm.channels = append(pwm.channels, pwmPin)
	}

	return &rpiDriver{
		pins: pins,
		pwm:  pwm,
	}, nil
}
