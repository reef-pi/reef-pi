package ato

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestATO(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	telemetry := utils.TestTelemetry()
	conf := equipments.Config{DevMode: true}
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	inlets := connectors.NewInlets(store)
	inlets.DevMode = true
	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipments.New(conf, outlets, store, telemetry)
	if err := eqs.Setup(); err != nil {
		t.Error(err)
	}
	if err := outlets.Create(connectors.Outlet{Name: "ato-outlet", Pin: 21}); err != nil {
		t.Error(err)
	}
	if err := eqs.Create(equipments.Equipment{Outlet: "1"}); err != nil {
		t.Error(err)
	}
	if err := inlets.Create(connectors.Inlet{Name: "ato-sensor", Pin: 16}); err != nil {
		t.Error(err)
	}
	c, err := New(true, store, telemetry, eqs, inlets)

	if err != nil {
		t.Error(err)
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
	stats, err := c.statsMgr.Get("1")
	if err != nil {
		t.Error(err)
	}
	c.NotifyIfNeeded(a, stats.Current[0].(Usage))

	inUse, err := c.IsEquipmentInUse("-1")
	if err != nil {
		t.Error(err)
	}
	if inUse == true {
		t.Error("Imaginary equipment should not be in-use")
	}

	body = new(bytes.Buffer)
	json.NewEncoder(body).Encode(a)
	if err := tr.Do("POST", "/api/atos/1", body, nil); err != nil {
		t.Error("Failed to update udate exitsing using api. Error:", err)
	}
	c.Stop()
	c.Start()
	if err := tr.Do("GET", "/api/atos/1/usage", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get ato usage using api. Error:", err)
	}
	if err := tr.Do("DELETE", "/api/atos/1", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to delete ato using api. Error:", err)
	}
	c.Stop()

}
