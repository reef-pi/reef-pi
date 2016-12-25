package controller

import (
	"fmt"
	"github.com/hybridgroup/gobot"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"strconv"
)

type Outlet struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Board string `json:"board"`
	Pin   int    `json:"pin"`
	Type  string `json:"type"`
}

type OuteltAction struct {
	Action string `json:"action"`
	Value  int    `json:"value"`
}

func (o *Outlet) Perform(conn gobot.Connection, name string, a OuteltAction) error {
	switch o.Type {
	case "switch":
		driver := gpio.NewDirectPinDriver(conn, name, strconv.Itoa(o.Pin))
		if a.Action == "off" {
			if err := driver.Off(); err != nil {
				return err
			}
		} else {
			if err := driver.On(); err != nil {
				return err
			}
		}
	case "pwm":
		return fmt.Errorf("PWM outelets are not implemented")
	default:
		return fmt.Errorf("Unknown outlet type: %s", o.Type)
	}
	return nil
}
