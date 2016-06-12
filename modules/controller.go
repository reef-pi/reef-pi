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
