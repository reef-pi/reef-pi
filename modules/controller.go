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
	ReCirculator() Device
	CoolOff() error
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

func (n *NullController) ReCirculator() Device {
	return &NullDevice{}
}

func (n *NullController) CoolOff() error {
	time.Sleep(n.CollOffTime)
	return nil
}

type BC29Controller struct {
	returnPump        Pump
	recirculationPump Pump
}

func NewBC29Controller(returnPump, recirculationPump Pump) *BC29Controller {
	return &BC29Controller{
		returnPump:        returnPump,
		recirculationPump: recirculationPump,
	}
}

func (b *BC29Controller) ReturnPump() Device {
	return &Pump{
		Pin: b.returnPump.Pin,
	}
}

func (b *BC29Controller) ReCirculator() Device {
	return &Pump{
		Pin: b.recirculationPump.Pin,
	}
}

func (b *BC29Controller) CoolOff() error {
	time.Sleep(30 * time.Second)
	return nil
}
