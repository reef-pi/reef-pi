package equipment

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestEquipmentController(t *testing.T) {
	config := Config{
		DevMode: true,
	}
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	c := New(config, outlets, store, telemetry)
	c.AddCheck(func(_ string) (bool, error) { return false, nil })
	c.Setup()
	c.Stop()
	o := connectors.Outlet{
		Name: "bar",
		Pin:  23,
	}
	if err := outlets.Create(o); err != nil {
		t.Fatal(err)
	}
	o.Equipment = "1"
	// Create another outlet thats in use
	if err := outlets.Create(o); err != nil {
		t.Fatal(err)
	}

	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	outlets.LoadAPI(tr.Router)
	eq := Equipment{
		Name:   "foo",
		Outlet: "1",
	}
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup equipment subsystem. Error:", err)
	}
	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	enc.Encode(eq)
	if err := tr.Do("PUT", "/api/equipment", body, nil); err != nil {
		t.Fatal("Failed to create equipment using api")
	}

	body.Reset()
	eq.Outlet = "2"
	json.NewEncoder(body).Encode(eq)
	if err := tr.Do("PUT", "/api/equipment", body, nil); err == nil {
		t.Error("Equipment creation should fail due to outlet being in-use")
	}
	c.Start()

	body.Reset()
	ea := EquipmentAction{true}
	enc.Encode(ea)
	if err := tr.Do("POST", "/api/equipment/1/control", body, nil); err != nil {
		t.Fatal("Failed to control equipment using api")
	}

	var resp []Equipment
	if err := tr.Do("GET", "/api/equipment", strings.NewReader("{}"), &resp); err != nil {
		t.Fatal("GET /api/equipment API failure. Error:", err)
	}
	if len(resp) != 1 {
		t.Fatal("Expected 1 equipment. Found:", len(resp))
	}
	id := resp[0].ID
	var e1 Equipment
	if err := tr.Do("GET", "/api/equipment/"+id, strings.NewReader("{}"), &e1); err != nil {
		t.Fatal("GET '/api/equipment/<id>' API failure. Error:", err)
	}
	if err := c.outlets.Configure(eq.Outlet, true); err != nil {
		t.Fatal("Failed to configure outlet. Error:", err)
	}
	es, err := c.List()
	if err != nil {
		t.Fatal("Failed to list equipment. Error:", err)
	}

	if len(es) != 1 {
		t.Fatal("Expected only one equipment to be present. Found:", len(es))
	}
	eq = es[0]
	eq.Name = "Baz"
	body = new(bytes.Buffer)
	enc = json.NewEncoder(body)
	enc.Encode(eq)
	if err := tr.Do("POST", "/api/equipment/"+eq.ID, body, nil); err != nil {
		t.Fatal("Failed to update  equipment using api. Error:", err)
	}
	var outletsList []connectors.Outlet
	if err := tr.Do("GET", "/api/outlets", strings.NewReader("{}"), &outletsList); err != nil {
		t.Fatal("Failed to list outlets  using api")
	}
	if len(outletsList) != 2 {
		t.Fatal("Expected 2 outlets, found:", len(outletsList))
	}
	var outlet connectors.Outlet
	if err := tr.Do("GET", "/api/outlets/1", strings.NewReader("{}"), &outlet); err != nil {
		t.Fatal("Failed to get individual outlet  using api. Error:", err)
	}

	o.Name = "updated"
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&o)
	if err := tr.Do("POST", "/api/outlets/1", buf, nil); err != nil {
		t.Fatal("Failed to update individual outlet  using api. Error:", err)
	}
	c.synEquipment()
	if err := c.On("1", true); err != nil {
		t.Error(err)
	}
	if err := tr.Do("DELETE", "/api/equipment/"+eq.ID, buf, nil); err != nil {
		t.Fatal("Failed to delete equipment using api. Error:", err)
	}
	eq.Outlet = "123"
	if err := c.Create(eq); err == nil {
		t.Error("Equipment creation should fail if outlet is not present")
	}
	eq.Outlet = "1"
	if err := c.Create(eq); err != nil {
		t.Error("Failed to create equipment. Error:", err)
	}
	c.AddCheck(func(_ string) (bool, error) { return true, nil })
	c.IsEquipmentInUse("1")
	if err := c.Delete("1"); err == nil {
		t.Error("Equipment deletion should fail if rquipment is in use")
	}
	if err := c.On("-11", true); err == nil {
		t.Error("Controlling invalid equipment should fail")
	}

}

func TestUpdateEquipment(t *testing.T) {
	config := Config{
		DevMode: true,
	}
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	c := New(config, outlets, store, telemetry)
	c.Setup()

	o1 := connectors.Outlet{
		Name: "O1",
		Pin:  23,
	}
	if err := outlets.Create(o1); err != nil {
		t.Fatal(err)
	}

	o2 := connectors.Outlet{
		Name: "O2",
		Pin:  4,
	}
	if err := outlets.Create(o2); err != nil {
		t.Fatal(err)
	}

	//create equipment
	eq := Equipment{
		Name:   "Equipment 1",
		Outlet: "1",
	}

	if err := c.Create(eq); err != nil {
		t.Fatal(err)
	}

	eq.Outlet = "2"
	if err := c.Update("1", eq); err != nil {
		t.Fatal(err)
	}
}
