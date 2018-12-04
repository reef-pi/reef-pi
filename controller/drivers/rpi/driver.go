package rpi

import (
	"fmt"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"

	pwmdriver "github.com/reef-pi/rpi/pwm"

	"github.com/kidoman/embd"
	"github.com/pkg/errors"
)

type rpiDriver struct {
	pins        map[string]*rpiPin
	pwmChannels map[string]*rpiPwmChannel

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
	if r.pins == nil {
		r.pins = make(map[string]*rpiPin)
	}
	if r.pwmChannels == nil {
		r.pwmChannels = make(map[string]*rpiPwmChannel)
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
		r.pins[pin.name] = &pin
	}

	pwmDriver := r.newPwmDriver()

	for _, pin := range []int{0, 1} {
		pwmPin := &rpiPwmChannel{
			channel:   pin,
			driver:    pwmDriver,
			frequency: s.RPI_PWMFreq * 100000,
			name:      fmt.Sprintf("%d", pin),
		}
		r.pwmChannels[pwmPin.name] = pwmPin
	}

	return nil
}

func NewRPiDriver(s settings.Settings, b i2c.Bus) (driver.Driver, error) {
	d := &rpiDriver{}
	err := d.init(s)
	if err != nil {
		return nil, err
	}
	return d, nil
}
