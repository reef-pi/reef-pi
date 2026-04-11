package temperature

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

func setupTempController(t *testing.T) *Controller {
	t.Helper()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	outlets := con.DM().Outlets()
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipment.New(con)
	if err := eqs.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := outlets.Create(connectors.Outlet{Name: "O1", Pin: 21, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}
	if err := eqs.Create(equipment.Equipment{Outlet: "1", Name: "Heater"}); err != nil {
		t.Fatal(err)
	}
	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	return c
}

func TestTCWithinRange(t *testing.T) {
	tc := &TC{Min: 72, Max: 82}
	if !tc.WithinRange(75) {
		t.Error("75 should be within [72, 82]")
	}
	if !tc.WithinRange(72) {
		t.Error("72 (lower bound) should be within range")
	}
	if !tc.WithinRange(82) {
		t.Error("82 (upper bound) should be within range")
	}
	if tc.WithinRange(71) {
		t.Error("71 should be below range")
	}
	if tc.WithinRange(83) {
		t.Error("83 should be above range")
	}
}

func TestTCInUse(t *testing.T) {
	c := setupTempController(t)
	// InUse is a stub that always returns empty (no error)
	deps, err := c.InUse("equipment", "1")
	if err != nil {
		t.Error("InUse should not error:", err)
	}
	_ = deps
}

func TestTCGetEntity(t *testing.T) {
	c := setupTempController(t)
	if _, err := c.GetEntity("1"); err == nil {
		t.Error("GetEntity should return error (not supported)")
	}
}

func TestTCNotifyIfNeeded(t *testing.T) {
	c := setupTempController(t)
	tc := &TC{Name: "Water", Notify: Notify{Enable: false}}

	// disabled — no-op
	c.NotifyIfNeeded(tc, 80.0)

	// enabled, high
	tc.Notify.Enable = true
	tc.Notify.Min = 72
	tc.Notify.Max = 82
	c.NotifyIfNeeded(tc, 85.0)

	// enabled, low
	c.NotifyIfNeeded(tc, 70.0)

	// enabled, in range — no alert
	c.NotifyIfNeeded(tc, 77.0)
}

func TestTCCalibrate(t *testing.T) {
	c := setupTempController(t)

	tc := &TC{
		Name:   "Water",
		Period: 5,
		Enable: false,
	}
	if err := c.Create(tc); err != nil {
		t.Fatal("Create failed:", err)
	}

	ms := []interface{}{}
	_ = ms
	// Calibrate with empty measurement set should fail
	if err := c.Calibrate("1", nil); err == nil {
		t.Error("Calibrate with nil measurements should fail")
	}
}
