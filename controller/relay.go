package controller

import (
	"github.com/hybridgroup/gobot"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"log"
)

type RelayConfig struct {
	Pin  string `json:"pin,omitempty"`
	Name string `json:"name,omitempty"`
}

type Relay struct {
	config RelayConfig
	driver *gpio.DirectPinDriver
}

func NewRelay(config RelayConfig, conn gobot.Connection) *Relay {
	return &Relay{
		config: config,
		driver: gpio.NewDirectPinDriver(conn, config.Name, config.Pin),
	}
}

func (r *Relay) Type() string {
	return "relay"
}

func (r *Relay) On() error {
	log.Printf("Device[%s] On\n", r.Name())
	return r.driver.On()
}

func (r *Relay) Off() error {
	log.Printf("Device[%s] Off\n", r.Name())
	return r.driver.Off()
}
func (r *Relay) Name() string {
	return r.config.Name
}

func (r *Relay) Config() interface{} {
	return r.config
}
