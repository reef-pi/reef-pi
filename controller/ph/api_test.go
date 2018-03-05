package ph

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"testing"
	"time"
)

func TestPhAPI(t *testing.T) {
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	conf := Config{DevMode: true}
	c := New(conf, i2c.MockBus(), store, telemetry)
	tr := utils.NewTestRouter()
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.LoadAPI(tr.Router)

	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(&Probe{Name: "Foo", Period: 1, Enable: true})
	if err := tr.Do("PUT", "/api/phprobes", body, nil); err != nil {
		t.Fatal("Failed to create ph probe using api. Error:", err)
	}
	c.Start()
	if err := tr.Do("GET", "/api/phprobes/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get ph probe using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/phprobes", new(bytes.Buffer), nil); err != nil {
		t.Fatal("failed to list ph probe using api. error:", err)
	}
	time.Sleep(2 * time.Second)
	if err := tr.Do("GET", "/api/phprobes/1/readings", new(bytes.Buffer), nil); err != nil {
		t.Fatal("failed to get ph probe readings using api. error:", err)
	}
	body.Reset()
	json.NewEncoder(body).Encode(&Probe{Name: "Foo", Period: 1, Enable: false})
	if err := tr.Do("POST", "/api/phprobes/1", body, nil); err != nil {
		t.Fatal("Failed to update ph probe using api. Error:", err)
	}
	body.Reset()
	json.NewEncoder(body).Encode(&CalibrationDetails{Type: "high", Value: 10})
	if err := tr.Do("POST", "/api/phprobes/1/calibrate", body, nil); err != nil {
		t.Fatal("Failed to calibrate ph probe using api. Error:", err)
	}

	c.Stop()
	if err := tr.Do("DELETE", "/api/phprobes/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete ph probe using api. Error:", err)
	}
}
