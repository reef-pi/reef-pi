package rpi

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/types/driver"

	"github.com/reef-pi/rpi/pwm"
)

type rpiPwmChannel struct {
	channel int
	name    string
	pwm     *rpiPwm
}

type rpiPwm struct {
	driver    pwm.Driver
	channels  []*rpiPwmChannel
	frequency int
}

func (p *rpiPwmChannel) Set(value float64) error {
	if value < 0 || value > 100 {
		return fmt.Errorf("value must be 0-100, got %f", value)
	}

	setting := float64(p.pwm.frequency/1000) * value
	return p.pwm.driver.DutyCycle(p.channel, int(setting))
}

func (p *rpiPwmChannel) Name() string {
	return p.name
}

func (r *rpiDriver) PWMChannels() []driver.PWMChannel {
	var chs []driver.PWMChannel
	for _, ch := range r.pwm.channels {
		chs = append(chs, ch)
	}
	return chs
}
