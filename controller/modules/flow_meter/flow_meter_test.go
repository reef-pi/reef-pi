package flow_meter

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func setupTestController(t *testing.T) *Controller {
	t.Helper()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller:", err)
	}
	c := New(true, con)
	if err := c.Setup(); err != nil {
		t.Fatal("Setup failed:", err)
	}
	return c
}

func TestFlowMeterIsValid(t *testing.T) {
	t.Parallel()

	f := FlowMeter{}
	if err := f.IsValid(); err == nil {
		t.Error("expected error for empty name")
	}

	f.Name = "test"
	if err := f.IsValid(); err == nil {
		t.Error("expected error for empty sensor path")
	}

	f.Sensor = "/tmp/pulses"
	if err := f.IsValid(); err == nil {
		t.Error("expected error for zero pulses_per_liter")
	}

	f.PulsesPerLiter = 450
	if err := f.IsValid(); err != nil {
		t.Error("expected valid flow meter, got:", err)
	}
}

func TestFlowMeterCRUD(t *testing.T) {
	t.Parallel()
	c := setupTestController(t)

	f := FlowMeter{
		Name:           "test-meter",
		Sensor:         "/tmp/test_pulses",
		PulsesPerLiter: 450,
		Period:         60,
	}
	if err := c.Create(f); err != nil {
		t.Fatal("Create failed:", err)
	}

	fms, err := c.List()
	if err != nil {
		t.Fatal("List failed:", err)
	}
	if len(fms) != 1 {
		t.Fatalf("expected 1 flow meter, got %d", len(fms))
	}

	got, err := c.Get("1")
	if err != nil {
		t.Fatal("Get failed:", err)
	}
	if got.Name != f.Name {
		t.Errorf("expected name %q, got %q", f.Name, got.Name)
	}

	got.Name = "updated"
	if err := c.Update("1", got); err != nil {
		t.Fatal("Update failed:", err)
	}

	if err := c.Delete("1"); err != nil {
		t.Fatal("Delete failed:", err)
	}
}

func TestFlowMeterAPI(t *testing.T) {
	t.Parallel()
	c := setupTestController(t)

	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)

	f := FlowMeter{
		Name:           "api-meter",
		Sensor:         "/tmp/api_pulses",
		PulsesPerLiter: 450,
		Period:         60,
	}
	body, _ := json.Marshal(f)

	if err := tr.Do("PUT", "/api/flow_meters", bytes.NewBuffer(body), nil); err != nil {
		t.Fatal("PUT /api/flow_meters failed:", err)
	}
	if err := tr.Do("GET", "/api/flow_meters", new(bytes.Buffer), nil); err != nil {
		t.Fatal("GET /api/flow_meters failed:", err)
	}
	if err := tr.Do("GET", "/api/flow_meters/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("GET /api/flow_meters/1 failed:", err)
	}
	if err := tr.Do("GET", "/api/flow_meters/1/readings", new(bytes.Buffer), nil); err != nil {
		t.Fatal("GET /api/flow_meters/1/readings failed:", err)
	}
	if err := tr.Do("POST", "/api/flow_meters/1", bytes.NewBuffer(body), nil); err != nil {
		t.Fatal("POST /api/flow_meters/1 failed:", err)
	}
	if err := tr.Do("DELETE", "/api/flow_meters/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("DELETE /api/flow_meters/1 failed:", err)
	}
}

func TestReadPulseCountFromFile(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	path := filepath.Join(dir, "pulses")

	if err := os.WriteFile(path, []byte("12345\n"), 0600); err != nil {
		t.Fatal(err)
	}

	c := setupTestController(t)
	c.devMode = false

	count, err := c.readPulseCount(path)
	if err != nil {
		t.Fatal("readPulseCount failed:", err)
	}
	if count != 12345 {
		t.Errorf("expected 12345, got %d", count)
	}
}

func TestFlowRateComputation(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	path := filepath.Join(dir, "pulses")

	if err := os.WriteFile(path, []byte("450\n"), 0600); err != nil {
		t.Fatal(err)
	}

	c := setupTestController(t)
	c.devMode = false
	c.lastCounts["1"] = 0

	f := FlowMeter{
		ID:             "1",
		Name:           "test",
		Sensor:         path,
		PulsesPerLiter: 450,
		Period:         60,
	}

	if err := c.readAndRecord(f); err != nil {
		t.Fatal("readAndRecord failed:", err)
	}
}
