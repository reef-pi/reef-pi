package ph

import (
	"testing"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller"
)

func TestPhAPI(t *testing.T) {
	t.Parallel()
	r, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	c := New(true, r)
	if err := c.Setup(); err != nil {
		t.Error(err)
	}

	p := &Probe{Name: "Foo", Period: 1, Enable: true}
	p.Notify.Enable = true
	if err := c.Create(*p); err != nil {
		t.Fatal("Failed to create ph probe:", err)
	}

	c.Start()

	if err := c.Create(*p); err != nil {
		t.Fatal("Failed to create second ph probe:", err)
	}

	if _, err := c.Get("1"); err != nil {
		t.Fatal("Failed to get ph probe:", err)
	}
	if _, err := c.List(); err != nil {
		t.Fatal("Failed to list ph probes:", err)
	}
	if _, err := c.Readings("1"); err != nil {
		t.Error("Failed to get readings:", err)
	}

	p.Enable = false
	if err := c.Update("1", *p); err != nil {
		t.Fatal("Failed to update ph probe:", err)
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
		{Observed: 7.8, Expected: 8.1},
	}
	if err := c.Calibrate("1", ms); err != nil {
		t.Error(err)
	}
	cp := CalibrationPoint{
		Observed: 7.8,
		Expected: 8.1,
		Type:     "low",
	}
	if err := c.CalibratePoint("1", cp); err != nil {
		t.Error(err)
	}

	probe, err := c.Get("1")
	if err != nil {
		t.Fatal("Failed to get probe for read:", err)
	}
	if _, err := c.Read(probe); err != nil {
		t.Error("Failed to read ph probe:", err)
	}

	if err := c.Delete("1"); err != nil {
		t.Fatal("Failed to delete ph probe:", err)
	}
	c.Stop()
}
