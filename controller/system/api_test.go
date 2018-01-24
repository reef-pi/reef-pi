package system

import (
	"bytes"
	"github.com/reef-pi/reef-pi/controller/utils"
	"strings"
	"testing"
)

func TestSystemController(t *testing.T) {
	config := Config{
		DevMode:   true,
		Name:      "test-system",
		Interface: "lo0",
	}
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

	if err := tr.Do("POST", "/api/display/on", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to switch  on display using api")
	}
	if err := tr.Do("POST", "/api/display/off", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to switch  on display using api")
	}
	if err := tr.Do("GET", "/api/display", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to get display brightness using api")
	}
	if err := tr.Do("POST", "/api/display", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to set display brightness using api")
	}
	if err := tr.Do("POST", "/api/admin/poweroff", new(bytes.Buffer), nil); err != nil {
		t.Fatal(err)
	}
	if err := tr.Do("POST", "/api/admin/reboot", new(bytes.Buffer), nil); err != nil {
		t.Fatal(err)
	}
	if err := tr.Do("POST", "/api/admin/reload", new(bytes.Buffer), nil); err != nil {
		t.Fatal(err)
	}
	var resp Summary
	if err := tr.Do("GET", "/api/info", strings.NewReader("{}"), &resp); err != nil {
		t.Fatal(err)
	}
	if _, err := c.lastStartTime(); err != nil {
		t.Error(err)
	}
	if _, err := c.currentDisplayState(); err != nil {
		t.Error(err)
	}
	if _, err := c.getBrightness(); err != nil {
		t.Error(err)
	}
}
