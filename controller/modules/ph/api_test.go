package ph

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestPhAPI(t *testing.T) {
	t.Parallel()
	r, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	c := New(true, r)
	tr := utils.NewTestRouter()
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.LoadAPI(tr.Router)

	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	p := &Probe{Name: "Foo", Period: 1, Enable: true}
	p.Notify.Enable = true
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
	p.Enable = false
	p.Control = true
	if err := c.Update("1", *p); err != nil {
		t.Error(err)
	}
	p.loadHomeostasis(r)
	c.checkAndControl(*p)
	ms := []hal.Measurement{
		hal.Measurement{
			Observed: 7.8,
			Expected: 8.1,
		},
	}
	if err := c.Calibrate("1", ms); err != nil {
		t.Error(err)
	}
	cp := CalibrationPoint{
		Observed: 7.8,
		Expected: 8.1,
		Type:     "low",
	}
	body.Reset()
	if err := c.CalibratePoint("1", cp); err != nil {
		t.Error(err)
	}
	body.Reset()
	if err := json.NewEncoder(body).Encode(&ms); err != nil {
		t.Error(err)
	}
	if err := tr.Do("POST", "/api/phprobes/1/calibrate", body, nil); err != nil {
		t.Fatal("Failed to calibrate ph probe using api. Error:", err)
	}
	body.Reset()
	if err := json.NewEncoder(body).Encode(&cp); err != nil {
		t.Error(err)
	}
	if err := tr.Do("POST", "/api/phprobes/1/calibratepoint", body, nil); err != nil {
		t.Fatal("Failed to calibratepoint ph probe using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/phprobes/1/read", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to read ph probe using api. Error:", err)
	}

	if err := tr.Do("DELETE", "/api/phprobes/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete ph probe using api. Error:", err)
	}
	c.Stop()
}
