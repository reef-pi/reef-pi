package rpi

import (
	"fmt"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"

	pwmdriver "github.com/reef-pi/rpi/pwm"

	"github.com/kidoman/embd"
	"github.com/pkg/errors"
)

type rpiDriver struct {
	pins        []*rpiPin
	pwmChannels []*rpiPwmChannel

	newDigitalPin func(key interface{}) (embd.DigitalPin, error)
	newPwmDriver  func() pwmdriver.Driver
}

func (r *rpiDriver) Metadata() driver.Metadata {
	return driver.Metadata{
		Name:        "rpi",
		Description: "hardware peripherals and GPIO channels on the base raspberry pi hardware",
		Capabilities: driver.Capabilities{
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

func (r *rpiDriver) init(s settings.Settings) error {
	if r.newDigitalPin == nil {
		r.newDigitalPin = embd.NewDigitalPin
	}
	if r.newPwmDriver == nil {
		r.newPwmDriver = pwmdriver.New
	}

	for pin := range validGPIOPins {
		digitalPin, err := r.newDigitalPin(pin)

		if err != nil {
			return errors.Wrapf(err, "can't build rpi channel %d", pin)
		}

		pin := rpiPin{
			name:       fmt.Sprintf("GP%d", pin),
			pin:        pin,
			digitalPin: digitalPin,
		}
		r.pins = append(r.pins, &pin)
	}

	pwmDriver := pwmdriver.New()

	for _, pin := range []int{1, 2} {
		pwmPin := &rpiPwmChannel{
			channel:   pin,
			driver:    pwmDriver,
			frequency: s.RPI_PWMFreq * 100000,
		}
		r.pwmChannels = append(r.pwmChannels, pwmPin)
	}

	return nil
}

func NewRPiDriver(s settings.Settings) (driver.Driver, error) {
	d := &rpiDriver{}
	err := d.init(s)
	if err != nil {
		return nil, err
	}
	return d, nil
}
