package ato

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

func TestController(t *testing.T) {
	t.Parallel()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	drvrs := drivers.TestDrivers(con.Store())
	outlets := connectors.NewOutlets(drvrs, con.Store())
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	inlets := connectors.NewInlets(drvrs, con.Store())
	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipment.New(con)
	if err := eqs.Setup(); err != nil {
		t.Error(err)
	}
	if err := outlets.Create(connectors.Outlet{Name: "ato-outlet", Pin: 21, Driver: "rpi"}); err != nil {
		t.Error(err)
	}
	if err := eqs.Create(equipment.Equipment{Outlet: "1"}); err != nil {
		t.Error(err)
	}
	if err := inlets.Create(connectors.Inlet{Name: "ato-sensor", Pin: 16, Driver: "rpi"}); err != nil {
		t.Error(err)
	}
	c, e := New(true, con)
	if e != nil {
		t.Error(e)
	}
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.Start()
	a := ATO{Name: "fooo", Control: true, Inlet: "1", Period: 1, Pump: "1", Enable: true}
	if err := c.Create(a); err != nil {
		t.Error("Failed to create ato:", err)
	}
	if _, err := c.List(); err != nil {
		t.Error("Failed to list atos:", err)
	}
	if _, err := c.Get("1"); err != nil {
		t.Error("Failed to get ato:", err)
	}
	if err := c.On("1", true); err != nil {
		t.Error(err)
	}

	a.ID = "1"
	c.Check(a)
	_, err = c.Read(a)
	if err != nil {
		t.Error(err)
	}
	if err := c.Control(a, 0); err != nil {
		t.Error(err)
	}
	if err := c.Control(a, 1); err != nil {
		t.Error(err)
	}
	a.Notify.Enable = true
	if _, err := c.Usage("1"); err != nil {
		t.Error(err)
	}
	c.NotifyIfNeeded(a, 0)

	if err := c.Update("1", a); err != nil {
		t.Error("Failed to update ato:", err)
	}
	c.Stop()
	c.Start()
	a1 := ATO{
		Name:    "fooo",
		Control: true,
		Inlet:   "1",
		Period:  0,
		Pump:    "",
	}
	c.Check(a1)
	if err := c.Control(a1, 10); err != nil {
		t.Error(err)
	}
	a1.Pump = "3"
	if err := c.Control(a1, 1); err != nil {
		t.Error(err)
	}
	q := make(chan struct{})
	c.Run(a1, q)
	if err := c.Create(a1); err == nil {
		t.Error("ATO creation should fail if period is set to zero")
	}
	if err := c.Update("1", a1); err == nil {
		t.Error("ATO update should fail if period is set to zero")
	}
	if _, err := c.Usage("1"); err != nil {
		t.Error("Failed to get ato usage:", err)
	}
	if err := c.Delete("1"); err != nil {
		t.Error("Failed to delete ato:", err)
	}
	c.Stop()
}
