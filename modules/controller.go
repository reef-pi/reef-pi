package modules

import (
	"time"
)

type Device interface {
	On() error
	Off() error
}

type Controller interface {
	Heater() Device
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

func (n *NullController) Heater() Device {
	return &NullDevice{}
}

type PiController struct {
	returnPump Pump
	powerHead  Pump
	heater     Relay
}

func NewPiController(returnPump, powerHead Pump) *PiController {
	return &PiController{
		returnPump: returnPump,
		powerHead:  powerHead,
	}
}

func (b *PiController) ReturnPump() Device {
	return &Pump{
		Pin: b.returnPump.Pin,
	}
}

func (b *PiController) Heater() Device {
	return &Relay{
		Pin: b.heater.Pin,
	}
}

func (b *PiController) PowerHead() Device {
	return &Pump{
		Pin: b.powerHead.Pin,
	}
}

func (b *PiController) CoolOff() {
	coolOffTime := b.returnPump.CoolOffTime
	if b.powerHead.CoolOffTime > b.returnPump.CoolOffTime {
		coolOffTime = b.powerHead.CoolOffTime
	}
	time.Sleep(coolOffTime * time.Second)
}

func (b *PiController) TurnOffPumps() error {
	if err := b.returnPump.Off(); err != nil {
		return err
	}
	return b.powerHead.Off()
}

func (b *PiController) TurnOnPumps() error {
	if err := b.returnPump.On(); err != nil {
		return err
	}
	return b.powerHead.On()
}
