package controller

import (
	"github.com/hybridgroup/gobot"
	"github.com/hybridgroup/gobot/platforms/gpio"
)

type Relay struct {
	name string
	pin  *gpio.DirectPinDriver
}

func NewRelay(name string, conn gobot.Connection, pin string) *Relay {
	return &Relay{
		name: name,
		pin:  gpio.NewDirectPinDriver(conn, name, pin),
	}
}

func (r *Relay) On() error {
	return r.pin.DigitalWrite(byte(1))
}

func (r *Relay) Off() error {
	return r.pin.DigitalWrite(byte(0))
}
func (r *Relay) Name() string {
	return r.name
}
