package equipments

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"strings"
	"testing"
)

func TestEquipmentController(t *testing.T) {
	config := Config{
		DevMode: true,
		Outlets: make(map[string]Outlet),
	}
	config.Outlets["bar"] = Outlet{Name: "bar", Pin: 4}
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	c := New(config, store, telemetry)
	c.Setup()
	c.Start()
	c.Stop()
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	eq := Equipment{
		Name:   "foo",
		Outlet: "bar",
	}
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup equipments subsystem. Error:", err)
	}
	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	enc.Encode(eq)

	if err := tr.Do("PUT", "/api/equipments", body, nil); err != nil {
		t.Fatal("Failed to create equipment using api")
	}

	var resp []Equipment
	if err := tr.Do("GET", "/api/equipments", strings.NewReader("{}"), &resp); err != nil {
		t.Fatal("GET /api/equipments API failure. Error:", err)
	}
	if len(resp) != 1 {
		t.Fatal("Expected 1 equipment. Found:", len(resp))
	}
	id := resp[0].ID
	var e1 Equipment
	if err := tr.Do("GET", "/api/equipments/"+id, strings.NewReader("{}"), &e1); err != nil {
		t.Fatal("GET '/api/equipments/<id>' API failure. Error:", err)
	}

	if err := c.ConfigureOutlet(eq.Outlet, true); err != nil {
		t.Fatal("Failed to configure outlet. Error:", err)
	}
	es, err := c.List()
	if err != nil {
		t.Fatal("Failed to list equipments. Error:", err)
	}

	if len(es) != 1 {
		t.Fatal("Expected only one equipment to be present. Found:", len(es))
	}
	eq = es[0]
	eq.Name = "Baz"
	body = new(bytes.Buffer)
	enc = json.NewEncoder(body)
	enc.Encode(eq)
	if err := tr.Do("POST", "/api/equipments/"+eq.ID, body, nil); err != nil {
		t.Fatal("Failed to update  equipment using api. Error:", err)
	}
	var outlets []Outlet
	if err := tr.Do("GET", "/api/outlets", strings.NewReader("{}"), &outlets); err != nil {
		t.Fatal("Failed to list outlets  using api")
	}
	if len(outlets) != 1 {
		t.Fatal("Expected 1 outlet, found:", len(outlets))
	}
	var outlet Outlet
	if err := tr.Do("GET", "/api/outlets/bar", strings.NewReader("{}"), &outlet); err != nil {
		t.Fatal("Failed to get individual outlet  using api. Error:", err)
	}

	a := OutletAction{
		On: true,
	}
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&a)
	if err := tr.Do("POST", "/api/outlets/bar", buf, nil); err != nil {
		t.Fatal("Failed to update individual outlet  using api. Error:", err)
	}
	c.synEquipments()
	if err := tr.Do("DELETE", "/api/equipments/"+eq.ID, buf, nil); err != nil {
		t.Fatal("Failed to delete equipment using api. Error:", err)
	}
}
