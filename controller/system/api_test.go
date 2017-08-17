package system

import (
	//	"bytes"
	//	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"strings"
	"testing"
)

func TestSystemController(t *testing.T) {
	config := Config{
		Enable:    true,
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
	if err := tr.Do("POST", "/api/admin/reboot", strings.NewReader("{}"), nil); err != nil {
		t.Fatal(err)
	}
	if err := tr.Do("POST", "/api/admin/poweroff", strings.NewReader("{}"), nil); err != nil {
		t.Fatal(err)
	}
	var resp Summary
	if err := tr.Do("GET", "/api/info", strings.NewReader("{}"), &resp); err != nil {
		t.Fatal(err)
	}

}
