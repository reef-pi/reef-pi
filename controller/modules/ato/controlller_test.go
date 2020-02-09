package ato

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/drivers"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestController(t *testing.T) {
	t.Parallel()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	drvrs := drivers.TestDrivers(con.Store())
	conf := equipment.Config{DevMode: true}
	outlets := connectors.NewOutlets(drvrs, con.Store())
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	inlets := connectors.NewInlets(drvrs, con.Store())
	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipment.New(conf, outlets, con.Store(), con.Telemetry())
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
	c, e := New(true, con, inlets)

	if e != nil {
		t.Error(e)
	}
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.Start()
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	a := ATO{Name: "fooo", Control: true, Inlet: "1", Period: 1, Pump: "1", Enable: true}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(a)
	if err := tr.Do("PUT", "/api/atos", body, nil); err != nil {
		t.Error("Failed to create ato using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/atos", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to list ato using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/atos/1", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get ato using api. Error:", err)
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
	if _, err := c.statsMgr.Get("1"); err != nil {
		t.Error(err)
	}
	c.NotifyIfNeeded(a)

	body = new(bytes.Buffer)
	json.NewEncoder(body).Encode(a)
	if err := tr.Do("POST", "/api/atos/1", body, nil); err != nil {
		t.Error("Failed to update udate exitsing using api. Error:", err)
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
	if err := tr.Do("GET", "/api/atos/1/usage", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get ato usage using api. Error:", err)
	}
	if err := tr.Do("DELETE", "/api/atos/1", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to delete ato using api. Error:", err)
	}

	c.Stop()
}
