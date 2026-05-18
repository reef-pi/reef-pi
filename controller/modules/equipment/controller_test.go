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

func newTestEquipmentController(t *testing.T) *Controller {
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
	return c
}

func createTestOutlet(t *testing.T, c *Controller, outlet connectors.Outlet) {
	t.Helper()
	if err := c.outlets.Create(outlet); err != nil {
		t.Fatal(err)
	}
}

func TestEquipmentAPICRUD(t *testing.T) {
	c := newTestEquipmentController(t)
	createTestOutlet(t, c, connectors.Outlet{Name: "return", Pin: 23, Driver: "rpi"})

	eq := Equipment{Name: "Return Pump", Outlet: "1"}
	if err := c.Create(eq); err != nil {
		t.Fatal("Failed to create equipment:", err)
	}

	eqs, err := c.List()
	if err != nil {
		t.Fatal("Failed to list equipment:", err)
	}
	if len(eqs) != 1 {
		t.Fatalf("Expected 1 equipment, got %d", len(eqs))
	}
	id := eqs[0].ID

	e1, err := c.Get(id)
	if err != nil {
		t.Fatal("Failed to get equipment:", err)
	}
	if e1.Name != "Return Pump" || e1.Outlet != "1" {
		t.Fatalf("Unexpected equipment: %#v", e1)
	}

	e1.Name = "Skimmer"
	if err := c.Update(id, e1); err != nil {
		t.Fatal("Failed to update equipment:", err)
	}
	updated, err := c.Get(id)
	if err != nil {
		t.Fatal("Failed to get updated equipment:", err)
	}
	if updated.Name != "Skimmer" {
		t.Fatalf("Expected 'Skimmer', got %q", updated.Name)
	}

	if err := c.Delete(id); err != nil {
		t.Fatal("Failed to delete equipment:", err)
	}
}

func TestEquipmentAPIControl(t *testing.T) {
	c := newTestEquipmentController(t)
	createTestOutlet(t, c, connectors.Outlet{Name: "heater", Pin: 23, Driver: "rpi"})
	if err := c.Create(Equipment{Name: "Heater", Outlet: "1"}); err != nil {
		t.Fatal("Failed to create equipment:", err)
	}

	c.Start()
	if err := c.Control("1", true); err != nil {
		t.Fatal("Failed to control equipment:", err)
	}
	eq, err := c.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if !eq.On {
		t.Fatal("Expected equipment to be on after control call")
	}

	if err := c.On("-11", true); err == nil {
		t.Error("Controlling invalid equipment should fail")
	}
}

func TestEquipmentOutletSync(t *testing.T) {
	c := newTestEquipmentController(t)
	createTestOutlet(t, c, connectors.Outlet{Name: "return", Pin: 23, Driver: "rpi"})
	createTestOutlet(t, c, connectors.Outlet{Name: "skimmer", Pin: 24, Driver: "rpi", Equipment: "1"})

	eq := Equipment{Name: "Return Pump", Outlet: "1", On: true}
	if err := c.Create(eq); err != nil {
		t.Fatal(err)
	}
	if err := c.outlets.Configure(eq.Outlet, true); err != nil {
		t.Fatal("Failed to configure outlet:", err)
	}

	outlets, err := c.outlets.List()
	if err != nil {
		t.Fatal("Failed to list outlets:", err)
	}
	if len(outlets) != 2 {
		t.Fatalf("Expected 2 outlets, found %d", len(outlets))
	}

	outlet, err := c.outlets.Get("1")
	if err != nil {
		t.Fatal("Failed to get outlet:", err)
	}

	// Outlet LoadAPI is still legacy chi — wire it for this test.
	tr := utils.NewTestRouter()
	c.outlets.LoadAPI(tr.Router)
	outlet.Name = "updated"
	body := new(bytes.Buffer)
	if err := json.NewEncoder(body).Encode(outlet); err != nil {
		t.Fatal(err)
	}
	if err := tr.Do("POST", "/api/outlets/1", body, nil); err != nil {
		t.Fatal("Failed to update outlet via api:", err)
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

func outletBody(t *testing.T, outlet connectors.Outlet) *strings.Reader {
	t.Helper()
	b, err := json.Marshal(outlet)
	if err != nil {
		t.Fatal(err)
	}
	return strings.NewReader(string(b))
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

	o := connectors.Outlet{Name: "O-inuse", Pin: 10, Driver: "rpi"}
	if err := con.DM().Outlets().Create(o); err != nil {
		t.Fatal(err)
	}
	eq := Equipment{Name: "EQ-inuse", Outlet: "1"}
	if err := c.Create(eq); err != nil {
		t.Fatal("Create equipment failed:", err)
	}

	deps, err := c.InUse(storage.OutletBucket, "1")
	if err != nil {
		t.Error("InUse(outlets) error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected equipment dep for outlet '1'")
	}

	if _, err := c.InUse("unknown", "1"); err == nil {
		t.Error("Expected error for unknown dep type")
	}

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

	if err := outlets.Create(connectors.Outlet{Name: "O1", Pin: 23, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}
	if err := outlets.Create(connectors.Outlet{Name: "O2", Pin: 4, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}

	eq := Equipment{Name: "Equipment 1", Outlet: "1"}
	if err := c.Create(eq); err != nil {
		t.Fatal(err)
	}

	eq.Outlet = "2"
	if err := c.Update("1", eq); err != nil {
		t.Fatal(err)
	}
}
