package controller

import (
	"github.com/hybridgroup/gobot"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"log"
)

type LEDLight struct {
	name string
	pin  *gpio.DirectPinDriver
}

func NewLEDLight(name string, conn gobot.Connection, pin string) *LEDLight {
	log.Printf("Creating device name: %s, pin: %s\n", name, pin)
	return &LEDLight{
		name: name,
		pin:  gpio.NewDirectPinDriver(conn, name, pin),
	}
}

func (l *LEDLight) On() error {
	log.Printf("Device[%s] On\n", l.Name())
	return l.pin.On()
}

func (l *LEDLight) Off() error {
	log.Printf("Device[%s] Off\n", l.Name())
	return l.pin.Off()
}

func (l *LEDLight) Name() string {
	return l.name
}

func (l *LEDLight) SetValue(_ uint) error {
	return nil
}
