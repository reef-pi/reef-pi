package temperature

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestTemperatureAPI(t *testing.T) {
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
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
	if err := outlets.Create(connectors.Outlet{Name: "ato-outlet", Pin: 21}); err != nil {
		t.Error(err)
	}
	if err := eqs.Create(equipments.Equipment{Outlet: "1"}); err != nil {
		t.Error(err)
	}
	c, err := New(true, store, telemetry, eqs)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	c.config.Control = true
	c.config.Enable = true
	c.config.Notify.Enable = true
	c.Start()
	c.check()
	c.control(84)
	c.control(79)
	c.control(64)
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(&DefaultConfig)
	if err := tr.Do("POST", "/api/tc/config", body, nil); err != nil {
		t.Fatal("Failed to update temperature controller config using api")
	}
	if err := tr.Do("GET", "/api/tc/config", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get temperature controller config using api")
	}
	if err := tr.Do("GET", "/api/tc/readings", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get temperature controller config using api")
	}
	if err := tr.Do("GET", "/api/tc/usage", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get temperature controller config using api")
	}
	c.Stop()
}
