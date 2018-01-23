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
	eqs := equipments.New(conf, outlets, store, telemetry)
	if err := eqs.Setup(); err != nil {
		t.Error(err)
	}
	if err := outlets.Create(connectors.Outlet{Name: "ato-outlet", Pin: 1}); err != nil {
		t.Error(err)
	}
	if err := eqs.Create(equipments.Equipment{Outlet: "1"}); err != nil {
		t.Error(err)
	}
	c, err := New(true, store, telemetry, eqs)

	if err != nil {
		t.Error(err)
	}
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.config.Pump = "1"
	c.config.Enable = true
	c.config.Control = true
	c.Start()
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	if err := tr.Do("GET", "/api/ato", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get ato config using api. Error:", err)
	}
	_, err = c.Read()
	if err != nil {
		t.Error(err)
	}
	if err := c.Control(0); err != nil {
		t.Error(err)
	}
	if err := c.Control(1); err != nil {
		t.Error(err)
	}
	c.cachePump()
	c.updateUsage(10)
	c.updateUsage(15)
	c.config.Notify.Enable = true
	c.NotifyIfNeeded(c.usage.Value.(Usage))
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(DefaultConfig)
	if err := tr.Do("POST", "/api/ato", body, nil); err != nil {
		t.Error("Failed to update ato config using api. Error:", err)
	}

	if inUse, err := c.IsEquipmentInUse("-1"); err != nil {
		t.Error(err)
	} else {
		if inUse == true {
			t.Error("Imaginary equipment should not be in-use")
		}
	}
	defer c.Stop()
}
