package controller

import (
	"gobot.io/x/gobot"
	"gobot.io/x/gobot/drivers/gpio"
	"log"
)

type RelayConfig struct {
	Pin   string `json:"pin,omitempty"`
	Name  string `json:"name,omitempty"`
	State bool   `json:"state"`
	Type  string `json:"type"`
}

type Relay struct {
	config RelayConfig
	driver *gpio.DirectPinDriver
}

func NewRelay(config RelayConfig, conn gobot.Connection) *Relay {
	return &Relay{
		config: config,
		driver: gpio.NewDirectPinDriver(conn, config.Pin),
	}
}

func (r *Relay) Type() string {
	return "relay"
}

func (r *Relay) On() error {
	log.Printf("Device[%s] On\n", r.Name())
	if err := r.driver.On(); err != nil {
		return err
	}
	r.config.State = true
	return nil
}

func (r *Relay) Off() error {
	log.Printf("Device[%s] Off\n", r.Name())
	if err := r.driver.Off(); err != nil {
		return err
	}
	r.config.State = false
	return nil
}
func (r *Relay) Name() string {
	return r.config.Name
}

func (r *Relay) Config() interface{} {
	return r.config
}
