package modules

import (
	log "github.com/Sirupsen/logrus"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"github.com/hybridgroup/gobot/platforms/raspi"
	"time"
)

type Pump struct {
	Pin         string        `yaml:"pin"`
	CoolOffTime time.Duration `yaml:"cool_off_time"`
}

func (p *Pump) On() error {
	r := raspi.NewRaspiAdaptor("raspi")
	pin := gpio.NewDirectPinDriver(r, "pump", p.Pin)
	log.Infoln("Turning on pump via pin:", p.Pin)
	return pin.DigitalWrite(byte(1))
}

func (p *Pump) Off() error {
	r := raspi.NewRaspiAdaptor("raspi")
	pin := gpio.NewDirectPinDriver(r, "pump", p.Pin)
	log.Infoln("Turning off pump via pin:", p.Pin)
	return pin.DigitalWrite(byte(0))
}
