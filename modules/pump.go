package modules

import (
	"github.com/hybridgroup/gobot/platforms/gpio"
	"github.com/hybridgroup/gobot/platforms/raspi"
)

type Pump struct {
	Pin         string `yaml:"pin"`
	CoolOffTime uint   `yaml:"cool_off_time"`
}

func (p *Pump) On() error {
	r := raspi.NewRaspiAdaptor("raspi")
	pin := gpio.NewDirectPinDriver(r, "pump", p.Pin)
	return pin.DigitalWrite(byte(1))
}

func (p *Pump) Off() error {
	r := raspi.NewRaspiAdaptor("raspi")
	pin := gpio.NewDirectPinDriver(r, "pump", p.Pin)
	return pin.DigitalWrite(byte(0))
}
