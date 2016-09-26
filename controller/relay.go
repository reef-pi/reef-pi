package controller

import (
	"github.com/hybridgroup/gobot"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"log"
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
	log.Printf("Device[%s] On\n", r.Name())
	return r.pin.On()
}

func (r *Relay) Off() error {
	log.Printf("Device[%s] Off\n", r.Name())
	return r.pin.Off()
}
func (r *Relay) Name() string {
	return r.name
}
