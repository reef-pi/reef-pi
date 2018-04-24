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
	if err := outlets.Create(connectors.Outlet{Name: "temp-outlet", Pin: 21}); err != nil {
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
	tc := TC{
		Control: true,
		Enable:  true,
		Heater:  "1",
		Min:     77,
		Max:     81,
		Name:    "foo",
		Period:  60,
		Notify: Notify{
			Enable: true, Min: 78, Max: 81,
		},
	}
	c.Start()
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(&tc)
	if err := tr.Do("PUT", "/api/tcs", body, nil); err != nil {
		t.Fatal("Failed to create temperature controller config using api")
	}
	body.Reset()
	json.NewEncoder(body).Encode(&tc)
	if err := tr.Do("POST", "/api/tcs/1", body, nil); err != nil {
		t.Fatal("Failed to update temperature controller config using api")
	}
	if err := tr.Do("GET", "/api/tcs/1", new(bytes.Buffer), &tc); err != nil {
		t.Fatal("Failed to get temperature controller config using api")
	}
	c.Stop()
	c.Start()
	c.Check(tc)
	u := Usage{
		Temperature: 67,
	}
	c.control(tc, &u)
	u.Temperature = 83
	c.control(tc, &u)

	if err := tr.Do("GET", "/api/tcs/1/usage", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get temperature controller usage using api")
	}

	var sensors []TC
	if err := tr.Do("GET", "/api/tcs", new(bytes.Buffer), &sensors); err != nil {
		t.Fatal("Failed to list temperature controller config using api")
	}
	inUse, err := c.IsEquipmentInUse("1")
	if err != nil {
		t.Error(err)
	}
	if !inUse {
		t.Error("Equipment should be in use")
	}
	inUse, err = c.IsEquipmentInUse("12")
	if err != nil {
		t.Error(err)
	}
	if inUse {
		t.Error("Equipment should not be in use")
	}
	if err := tr.Do("DELETE", "/api/tcs/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete temperature controller config using api")
	}
	c.Stop()
}
