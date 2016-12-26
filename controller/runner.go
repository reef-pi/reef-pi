package controller

import (
	"fmt"
	"gobot.io/x/gobot/drivers/gpio"
	"log"
	"strconv"
)

type JobRunner struct {
	c      *Controller
	outlet string
	action OuteltAction
}

func (r *JobRunner) Run() {
	if err := r.c.ConfigureOutlet(r.outlet, r.action); err != nil {
		log.Println("ERROR:", err)
	}
}

func (c *Controller) Runner(job Job) (*JobRunner, error) {
	var e Equipment
	if err := c.store.Get("equipments", job.Equipment, &e); err != nil {
		return nil, err
	}
	if e.Outlet == "" {
		return nil, fmt.Errorf("Equipment: %s does not have associated outlet", e.Name)
	}
	a := OuteltAction{
		Action: job.Action,
		Value:  job.Value,
	}
	return &JobRunner{
		outlet: e.Outlet,
		c:      c,
		action: a,
	}, nil
}

func (c *Controller) doSwitching(pin int, action string) error {
	driver := gpio.NewDirectPinDriver(c.conn, strconv.Itoa(pin))
	if action == "off" {
		return driver.Off()
	}
	return driver.On()
}

func (c *Controller) doPWM(o Outlet, a OuteltAction) error {
	if a.Action == "off" {
		return c.pwm.Off(o.Pin)
	}
	return c.pwm.Set(o.Pin, a.Value)
}
