package modules

import (
	log "github.com/Sirupsen/logrus"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"github.com/hybridgroup/gobot/platforms/raspi"
)

type Relay struct {
	Pin string `yaml:"pin"`
}

func (r *Relay) On() error {
	adapter := raspi.NewRaspiAdaptor("raspi")
	pin := gpio.NewDirectPinDriver(adapter, "relay", r.Pin)
	log.Infoln("Turning on relay via pin:", r.Pin)
	return pin.DigitalWrite(byte(1))
}

func (r *Relay) Off() error {
	adapter := raspi.NewRaspiAdaptor("raspi")
	pin := gpio.NewDirectPinDriver(adapter, "pump", r.Pin)
	log.Infoln("Turning off pump via pin:", r.Pin)
	return pin.DigitalWrite(byte(0))
}
