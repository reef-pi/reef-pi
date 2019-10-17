package temperature

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

func TestTemperatureAPI(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	conf := equipment.Config{DevMode: true}
	drvrs := drivers.TestDrivers(con.Store())
	outlets := connectors.NewOutlets(drvrs, con.Store())
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipment.New(conf, outlets, con.Store(), con.Telemetry())
	if err := eqs.Setup(); err != nil {
		t.Error(err)
	}
	o1 := connectors.Outlet{Name: "O1", Pin: 21, Driver: "rpi"}
	if err := outlets.Create(o1); err != nil {
		t.Error(err)
	}
	o1.Pin = 19
	o1.Name = "O2"
	if err := outlets.Create(o1); err != nil {
		t.Error(err)
	}
	eq := equipment.Equipment{Outlet: "1", Name: "Heater"}
	if err := eqs.Create(eq); err != nil {
		t.Error(err)
	}
	eq.Name = "cooler"
	eq.Outlet = "2"
	if err := eqs.Create(eq); err != nil {
		t.Error(err)
	}
	c, err := New(true, con, eqs)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	tc := &TC{
		Control: true,
		Enable:  true,
		Heater:  "1",
		Cooler:  "2",
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

	if err := c.On("1", true); err != nil {
		t.Error(err)
	}
	c.Stop()
	c.Start()
	tc.loadHomeostasis(con)
	c.Check(tc)
	u := controller.Observation{
		Value: 67,
	}
	c.Check(tc)
	u.Value = 83
	c.Check(tc)
	u.Value = 70
	c.Check(tc)
	u.Value = 79
	c.Check(tc)

	if err := tr.Do("GET", "/api/tcs/1/usage", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get temperature controller usage using api")
	}

	var sensors []TC
	if err := tr.Do("GET", "/api/tcs/sensors", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to list temperature sensors using api", err)
	}
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
