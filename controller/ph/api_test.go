package ph

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
)

func TestPhAPI(t *testing.T) {
	r, err := utils.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	conf := Config{DevMode: true}
	c := New(conf, i2c.MockBus(), r)
	tr := utils.NewTestRouter()
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.LoadAPI(tr.Router)

	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	p := &Probe{Name: "Foo", Period: 1, Enable: true}
	p.Config.Notify.Enable = true
	enc.Encode(p)
	if err := tr.Do("PUT", "/api/phprobes", body, nil); err != nil {
		t.Fatal("Failed to create ph probe using api. Error:", err)
	}

	c.Start()

	body.Reset()
	enc.Encode(p)
	if err := tr.Do("PUT", "/api/phprobes", body, nil); err != nil {
		t.Fatal("Failed to create ph probe using api. Error:", err)
	}

	if err := tr.Do("GET", "/api/phprobes/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to get ph probe using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/phprobes", new(bytes.Buffer), nil); err != nil {
		t.Fatal("failed to list ph probe using api. error:", err)
	}
	tr.Do("GET", "/api/phprobes/1/readings", new(bytes.Buffer), nil)
	body.Reset()
	p.Enable = false
	enc.Encode(p)
	if err := tr.Do("POST", "/api/phprobes/1", body, nil); err != nil {
		t.Fatal("Failed to update ph probe using api. Error:", err)
	}
	calib := &CalibrationDetails{Type: "high", Value: 10}
	body.Reset()
	enc.Encode(calib)
	if err := tr.Do("POST", "/api/phprobes/1/calibrate", body, nil); err != nil {
		t.Fatal("Failed to calibrate ph probe using api. Error:", err)
	}
	calib.Type = "mid"
	calib.Value = 17
	if err := c.Calibrate("1", *calib); err == nil {
		t.Error("Calibration should fail if value is above 14")
	}
	calib.Value = 10
	if err := c.Calibrate("-11", *calib); err == nil {
		t.Error("Calibration of invalid probe id should fail")
	}
	if err := c.Calibrate("1", *calib); err != nil {
		t.Error("Mid point calibration failed", err)
	}
	calib.Type = "low"
	if err := c.Calibrate("1", *calib); err != nil {
		t.Error("Low point calibration failed", err)
	}
	calib.Type = "invalid"
	if err := c.Calibrate("1", *calib); err == nil {
		t.Error("invalid calibration type should throw error")
	}
	p.Enable = true
	if err := c.Update("1", *p); err != nil {
		t.Error(err)
	}
	if err := c.On("1", false); err != nil {
		t.Error(err)
	}
	if err := c.On("1", true); err != nil {
		t.Error(err)
	}
	if err := c.On("-1", false); err == nil {
		t.Error("Enabling invalid probe id should fail")
	}

	if err := tr.Do("DELETE", "/api/phprobes/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete ph probe using api. Error:", err)
	}
	c.Stop()
}
