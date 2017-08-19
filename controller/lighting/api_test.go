package lighting

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"strings"
	"testing"
	"time"
)

func TestLightingController(t *testing.T) {
	config := DefaultConfig
	config.DevMode = true
	config.Interval = 1 * time.Second
	config.Jacks["J1"] = Jack{
		Name: "J1",
		Pins: []int{23},
	}
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	c := New(config, store, telemetry)
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup lighting controller")
	}
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	c.Start()
	time.Sleep(2 * time.Second)
	c.Stop()

	l := Light{
		Jack: "J1",
		Name: "Foo",
	}
	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	enc.Encode(l)
	if err := tr.Do("PUT", "/api/lights", body, nil); err != nil {
		t.Fatal("Failed to create light using api")
	}
	var lights []Light
	if err := tr.Do("GET", "/api/lights", strings.NewReader("{}"), &lights); err != nil {
		t.Fatal("Failed to light using api")
	}
}
