package modules

import (
	"time"
)

type Device interface {
	On() error
	Off() error
}

type Controller interface {
	ReturnPump() Device
	PowerHead() Device
	CoolOff()
	TurnOffPumps() error
	TurnOnPumps() error
}

type NullDevice struct {
}

func (n *NullDevice) On() error {
	return nil
}

func (n *NullDevice) Off() error {
	return nil
}

type NullController struct {
	CollOffTime time.Duration
}

func (n *NullController) ReturnPump() Device {
	return &NullDevice{}
}

func (n *NullController) PowerHead() Device {
	return &NullDevice{}
}

func (n *NullController) CoolOff() {
	time.Sleep(n.CollOffTime)
}

func (n *NullController) TurnOffPumps() error {
	return nil
}

func (n *NullController) TurnOnPumps() error {
	return nil
}

type BC29Controller struct {
	returnPump Pump
	powerHead  Pump
}

func NewBC29Controller(returnPump, powerHead Pump) *BC29Controller {
	return &BC29Controller{
		returnPump: returnPump,
		powerHead:  powerHead,
	}
}

func (b *BC29Controller) ReturnPump() Device {
	return &Pump{
		Pin: b.returnPump.Pin,
	}
}

func (b *BC29Controller) PowerHead() Device {
	return &Pump{
		Pin: b.powerHead.Pin,
	}
}

func (b *BC29Controller) CoolOff() {
	coolOffTime := b.returnPump.CoolOffTime
	if b.powerHead.CoolOffTime > b.returnPump.CoolOffTime {
		coolOffTime = b.powerHead.CoolOffTime
	}
	time.Sleep(coolOffTime * time.Second)
}

func (b *BC29Controller) TurnOffPumps() error {
	if err := b.returnPump.Off(); err != nil {
		return err
	}
	return b.powerHead.Off()
}

func (b *BC29Controller) TurnOnPumps() error {
	if err := b.returnPump.On(); err != nil {
		return err
	}
	return b.powerHead.On()
}
