package controller

import (
	"fmt"
)

const OutletBucket = "outlets"

type Outlet struct {
	ID   string `json:"id" yaml:"id"`
	Name string `json:"name" yaml:"name"`
	Pin  int    `json:"pin" yaml:"pin"`
	Type string `json:"type" yaml:"type"`
}

func (c *Controller) GetOutlet(name string) (Outlet, error) {
	outlet, ok := c.state.config.Outlets[name]
	if !ok {
		return outlet, fmt.Errorf("No outlet named '%s' present", name)
	}
	return outlet, nil
}

func (c *Controller) ListOutlets() (*[]interface{}, error) {
	list := []interface{}{}
	for name, _ := range c.state.config.Outlets {
		data := map[string]string{
			"id":   name,
			"name": name,
		}
		list = append(list, &data)
	}
	return &list, nil
}

func (c *Controller) ConfigureOutlet(id string, on bool, value int) error {
	var o Outlet
	if err := c.store.Get(OutletBucket, id, &o); err != nil {
		return err
	}
	switch o.Type {
	case "switch":
		return c.doSwitching(o.Pin, on)
	case "pwm":
		if !c.config.EnablePWM {
			return fmt.Errorf("PWM is not enabled")
		}
		return c.doPWM(o.Pin, on, value)
	default:
		return fmt.Errorf("Unknown outlet type: %s", o.Type)
	}
	return nil
}
