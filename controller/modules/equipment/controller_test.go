package equipment

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func newTestEquipmentController(t *testing.T) (*Controller, *utils.TestRouter) {
	t.Helper()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	t.Cleanup(func() {
		con.Store().Close()
	})
	if err := con.DM().Outlets().Setup(); err != nil {
		t.Fatal(err)
	}
	c := New(con)
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup equipment subsystem. Error:", err)
	}
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	con.DM().Outlets().LoadAPI(tr.Router)
	return c, tr
}

func createTestOutlet(t *testing.T, c *Controller, outlet connectors.Outlet) {
	t.Helper()
	if err := c.outlets.Create(outlet); err != nil {
		t.Fatal(err)
	}
}

func equipmentBody(t *testing.T, eq Equipment) *bytes.Buffer {
	t.Helper()
	body := new(bytes.Buffer)
	if err := json.NewEncoder(body).Encode(eq); err != nil {
		t.Fatal(err)
	}
	return body
}

func equipmentActionBody(t *testing.T, on bool) *bytes.Buffer {
	t.Helper()
	body := new(bytes.Buffer)
	if err := json.NewEncoder(body).Encode(EquipmentAction{On: on}); err != nil {
		t.Fatal(err)
	}
	return body
}

func TestEquipmentAPICRUD(t *testing.T) {
	c, tr := newTestEquipmentController(t)
	createTestOutlet(t, c, connectors.Outlet{
		Name:   "return",
		Pin:    23,
		Driver: "rpi",
	})

	eq := Equipment{
		Name:   "Return Pump",
		Outlet: "1",
	}
	if err := tr.Do("PUT", "/api/equipment", equipmentBody(t, eq), nil); err != nil {
		t.Fatal("Failed to create equipment using api")
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
	if e1.Name != "Return Pump" || e1.Outlet != "1" {
		t.Fatalf("Unexpected equipment response: %#v", e1)
	}
	e1.Name = "Skimmer"
	if err := tr.Do("POST", "/api/equipment/"+e1.ID, equipmentBody(t, e1), nil); err != nil {
		t.Fatal("Failed to update  equipment using api. Error:", err)
	}

	var updated Equipment
	if err := tr.Do("GET", "/api/equipment/"+e1.ID, strings.NewReader("{}"), &updated); err != nil {
		t.Fatal("GET updated equipment API failure. Error:", err)
	}
	if updated.Name != "Skimmer" {
		t.Fatalf("Expected updated equipment name. Found: %s", updated.Name)
	}

	if err := tr.Do("DELETE", "/api/equipment/"+e1.ID, new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete equipment using api. Error:", err)
	}
}

func TestEquipmentAPIControl(t *testing.T) {
	c, tr := newTestEquipmentController(t)
	createTestOutlet(t, c, connectors.Outlet{
		Name:   "heater",
		Pin:    23,
		Driver: "rpi",
	})
	if err := tr.Do("PUT", "/api/equipment", equipmentBody(t, Equipment{Name: "Heater", Outlet: "1"}), nil); err != nil {
		t.Fatal("Failed to create equipment using api")
	}

	c.Start()
	if err := tr.Do("POST", "/api/equipment/1/control", equipmentActionBody(t, true), nil); err != nil {
		t.Fatal("Failed to control equipment using api")
	}
	eq, err := c.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if !eq.On {
		t.Fatal("Expected equipment to be on after control API call")
	}

	if err := c.On("-11", true); err == nil {
		t.Error("Controlling invalid equipment should fail")
	}
}

func TestEquipmentOutletSync(t *testing.T) {
	c, tr := newTestEquipmentController(t)
	createTestOutlet(t, c, connectors.Outlet{
		Name:   "return",
		Pin:    23,
		Driver: "rpi",
	})
	createTestOutlet(t, c, connectors.Outlet{
		Name:      "skimmer",
		Pin:       24,
		Driver:    "rpi",
		Equipment: "1",
	})

	eq := Equipment{Name: "Return Pump", Outlet: "1", On: true}
	if err := c.Create(eq); err != nil {
		t.Fatal(err)
	}
	if err := c.outlets.Configure(eq.Outlet, true); err != nil {
		t.Fatal("Failed to configure outlet. Error:", err)
	}

	var outletsList []connectors.Outlet
	if err := tr.Do("GET", "/api/outlets", strings.NewReader("{}"), &outletsList); err != nil {
		t.Fatal("Failed to list outlets using api")
	}
	if len(outletsList) != 2 {
		t.Fatal("Expected 2 outlets, found:", len(outletsList))
	}

	var outlet connectors.Outlet
	if err := tr.Do("GET", "/api/outlets/1", strings.NewReader("{}"), &outlet); err != nil {
		t.Fatal("Failed to get individual outlet using api. Error:", err)
	}

	outlet.Name = "updated"
	if err := tr.Do("POST", "/api/outlets/1", outletBody(t, outlet), nil); err != nil {
		t.Fatal("Failed to update individual outlet using api. Error:", err)
	}
	c.synEquipment()
	if err := c.On("1", true); err != nil {
		t.Error(err)
	}

	eq.Outlet = "123"
	if err := c.Create(eq); err == nil {
		t.Error("Equipment creation should fail if outlet is not present")
	}
}

func outletBody(t *testing.T, outlet connectors.Outlet) *bytes.Buffer {
	t.Helper()
	body := new(bytes.Buffer)
	if err := json.NewEncoder(body).Encode(outlet); err != nil {
		t.Fatal(err)
	}
	return body
}

func TestEquipmentInUseAndGetEntity(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	if err := con.DM().Outlets().Setup(); err != nil {
		t.Fatal(err)
	}
	c := New(con)
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}

	// Create an outlet then equipment referencing it
	o := connectors.Outlet{Name: "O-inuse", Pin: 10, Driver: "rpi"}
	if err := con.DM().Outlets().Create(o); err != nil {
		t.Fatal(err)
	}
	eq := Equipment{Name: "EQ-inuse", Outlet: "1"}
	if err := c.Create(eq); err != nil {
		t.Fatal("Create equipment failed:", err)
	}

	// InUse for outlet — should find the equipment
	deps, err := c.InUse(storage.OutletBucket, "1")
	if err != nil {
		t.Error("InUse(outlets) error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected equipment dep for outlet '1'")
	}

	// InUse for unknown type — should error
	if _, err := c.InUse("unknown", "1"); err == nil {
		t.Error("Expected error for unknown dep type")
	}

	// GetEntity — not supported
	if _, err := c.GetEntity("1"); err == nil {
		t.Error("Expected error from GetEntity")
	}
}

func TestUpdateEquipment(t *testing.T) {
	con, err := controller.TestController()
	defer con.Store().Close()

	if err != nil {
		t.Fatal("Failed to create test con. Error:", err)
	}
	outlets := con.DM().Outlets()
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	c := New(con)
	c.Setup()

	o1 := connectors.Outlet{
		Name:   "O1",
		Pin:    23,
		Driver: "rpi",
	}
	if err := outlets.Create(o1); err != nil {
		t.Fatal(err)
	}

	o2 := connectors.Outlet{
		Name:   "O2",
		Pin:    4,
		Driver: "rpi",
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
