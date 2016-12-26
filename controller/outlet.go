package controller

import (
	"encoding/json"
	"fmt"
	"gobot.io/x/gobot"
	"gobot.io/x/gobot/drivers/gpio"
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

func (o *Outlet) Perform(conn gobot.Connection, a OuteltAction) error {
	switch o.Type {
	case "switch":
		driver := gpio.NewDirectPinDriver(conn, strconv.Itoa(o.Pin))
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

func (c *Controller) GetOutlet(id string) (Outlet, error) {
	var outlet Outlet
	return outlet, c.store.Get("outlets", id, &outlet)
}

func (c *Controller) ListOutlets() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var outlet Outlet
		if err := json.Unmarshal(v, &outlet); err != nil {
			return nil, err
		}
		return map[string]string{
			"id":   outlet.ID,
			"name": outlet.Name,
		}, nil
	}
	return c.store.List("outlets", fn)
}

func (c *Controller) CreateOutlet(outlet Outlet) error {
	fn := func(id string) interface{} {
		outlet.ID = id
		return outlet
	}
	return c.store.Create("outlets", fn)
}

func (c *Controller) UpdateOutlet(id string, payload interface{}) error {
	return c.store.Update("outlets", id, payload)
}

func (c *Controller) DeleteOutlet(id string) error {
	return c.store.Delete("outlets", id)
}

func (c *Controller) ConfigureOutlet(id string, a OuteltAction) error {
	var outlet Outlet
	if err := c.store.Get("outlets", id, &outlet); err != nil {
		return err
	}
	return outlet.Perform(c.conn, a)
}
