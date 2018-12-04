package rpi

import (
	"fmt"
	"sort"

	"github.com/reef-pi/reef-pi/controller/types/driver"

	"github.com/reef-pi/rpi/pwm"
)

type rpiPwmChannel struct {
	channel   int
	name      string
	driver    pwm.Driver
	frequency int
}

func (p *rpiPwmChannel) Set(value float64) error {
	if value < 0 || value > 100 {
		return fmt.Errorf("value must be 0-100, got %f", value)
	}

	exported, err := p.driver.IsExported(p.channel)
	if err != nil {
		return err
	}
	if !exported {
		if err := p.driver.Export(p.channel); err != nil {
			return err
		}
	}
	if err := p.driver.Frequency(p.channel, p.frequency); err != nil {
		return err
	}

	setting := float64(p.frequency/1000) * value
	if err := p.driver.DutyCycle(p.channel, int(setting)); err != nil {
		return err
	}
	return p.driver.Enable(p.channel)
}

func (p *rpiPwmChannel) Name() string {
	return p.name
}

func (r *rpiDriver) PWMChannels() []driver.PWMChannel {
	var chs []driver.PWMChannel
	for _, ch := range r.pwmChannels {
		chs = append(chs, ch)
	}
	sort.Slice(chs, func(i, j int) bool { return chs[i].Name() < chs[j].Name() })
	return chs
}

func (r *rpiDriver) GetPWMChannel(name string) (driver.PWMChannel, error) {
	ch, ok := r.pwmChannels[name]
	if !ok {
		return nil, fmt.Errorf("unknown pwm channel %s", name)
	}
	return ch, nil
}
