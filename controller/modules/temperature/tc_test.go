package temperature

import (
	"testing"

	"github.com/reef-pi/hal"
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
	defer c.c.Store().Close()

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

func TestTCSetupLoadsCalibrations(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	tc := &TC{Name: "Calibrated", Period: 1, Sensor: "28-setup-calibration"}
	if err := c.repo.Create(tc); err != nil {
		t.Fatal(err)
	}
	measurements := []hal.Measurement{
		{Expected: 77, Observed: 76},
		{Expected: 82, Observed: 80},
	}
	if err := c.repo.UpdateCalibration(tc.Sensor, measurements); err != nil {
		t.Fatal(err)
	}

	reloaded, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := reloaded.Setup(); err != nil {
		t.Fatal(err)
	}
	if _, ok := reloaded.calibrators[tc.Sensor]; !ok {
		t.Fatal("expected setup to load calibrator")
	}
}

func TestTCSetupReturnsCalibrationError(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	tc := &TC{Name: "BadCalibration", Period: 1, Sensor: "28-bad-calibration"}
	if err := c.repo.Create(tc); err != nil {
		t.Fatal(err)
	}
	measurements := []hal.Measurement{
		{Expected: 77, Observed: 80},
		{Expected: 80, Observed: 80},
		{Expected: 82, Observed: 81},
	}
	if err := c.repo.UpdateCalibration(tc.Sensor, measurements); err != nil {
		t.Fatal(err)
	}

	reloaded, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := reloaded.Setup(); err == nil {
		t.Fatal("expected setup to fail on invalid calibration")
	}
}

func TestTCOnErrorAndOneShot(t *testing.T) {
	c := setupTempController(t)
	defer c.c.Store().Close()

	if err := c.On("missing", true); err == nil {
		t.Fatal("expected On to fail for unknown temperature controller")
	}

	tc := &TC{
		Name:    "OneShot",
		Period:  1,
		Enable:  false,
		OneShot: true,
		Min:     24,
		Max:     26,
	}
	if err := c.Create(tc); err != nil {
		t.Fatal(err)
	}
	if err := c.On(tc.ID, true); err != nil {
		t.Fatal(err)
	}
	updated, err := c.Get(tc.ID)
	if err != nil {
		t.Fatal(err)
	}
	if updated.Enable {
		t.Fatal("expected one-shot controller to disable itself after an in-range read")
	}
}

func TestTCCheckBranches(t *testing.T) {
	c := setupTempController(t)
	defer c.c.Store().Close()

	if reading, err := c.Check(&TC{Enable: false}); err != nil || reading != 0 {
		t.Fatalf("disabled check = %v, %v; expected 0, nil", reading, err)
	}

	c.devMode = false
	tc := &TC{
		ID:       "sensor-error",
		Name:     "SensorError",
		Enable:   true,
		Control:  true,
		FailSafe: true,
		Heater:   "1",
		Sensor:   "28-missing",
	}
	if reading, err := c.Check(tc); err == nil || reading != -1 {
		t.Fatalf("missing sensor check = %v, %v; expected -1 and error", reading, err)
	}

	c.devMode = true
	tc = &TC{
		ID:      "calibrated-check",
		Name:    "CalibratedCheck",
		Enable:  false,
		Period:  1,
		Sensor:  "28-check-calibration",
		Notify:  Notify{Enable: true, Min: 70, Max: 90},
		Control: false,
	}
	if err := c.Calibrate(tc.ID, []hal.Measurement{{Expected: 70, Observed: 70}, {Expected: 90, Observed: 90}}); err == nil {
		t.Fatal("expected calibrating an unknown controller to fail")
	}
	if err := c.Create(tc); err != nil {
		t.Fatal(err)
	}
	if err := c.Calibrate(tc.ID, []hal.Measurement{{Expected: 70, Observed: 70}, {Expected: 90, Observed: 90}}); err != nil {
		t.Fatal(err)
	}
	tc.Enable = true
	if reading, err := c.Check(tc); err != nil || reading <= 0 {
		t.Fatalf("calibrated check = %v, %v; expected positive reading and no error", reading, err)
	}
}
