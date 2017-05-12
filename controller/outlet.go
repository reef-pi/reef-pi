package controller

import (
	"fmt"
)

type Outlet struct {
	Name      string `json:"name" yaml:"name"`
	Pin       int    `json:"pin" yaml:"pin"`
	Type      string `json:"type" yaml:"type"`
	Equipment string `json:"equipment" yaml:"-"`
}

func (c *Controller) GetOutlet(name string) (Outlet, error) {
	outlet, ok := c.config.Outlets[name]
	if !ok {
		return outlet, fmt.Errorf("No outlet named '%s' present", name)
	}
	return outlet, nil
}

func (c *Controller) ListOutlets() (*[]interface{}, error) {
	list := []interface{}{}
	for _, o := range c.config.Outlets {
		o1 := o
		list = append(list, &o1)
	}
	return &list, nil
}

func (c *Controller) ConfigureOutlet(id string, on bool, value int) error {

	o, ok := c.config.Outlets[id]
	if !ok {
		return fmt.Errorf("Outlet named: '%s' does noy exist", id)
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
		return fmt.Errorf("Outlet '%s' has unknown outlet type: %s", o.Name, o.Type)
	}
}
