package ph

import (
	"testing"
	"time"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestProbeValidate(t *testing.T) {
	t.Parallel()

	// invalid period
	p := Probe{Period: 0}
	if err := p.Validate(); err == nil {
		t.Error("expected error for zero period")
	}

	// valid probe with no transformer
	p = Probe{Period: 5}
	if err := p.Validate(); err != nil {
		t.Error("expected valid probe, got:", err)
	}

	// valid transformer expression
	p = Probe{Period: 5, Transformer: "v * 2"}
	if err := p.Validate(); err != nil {
		t.Error("valid transformer should not error:", err)
	}

	// transformer with invalid expression
	p = Probe{Period: 5, Transformer: "v +++ invalid"}
	if err := p.Validate(); err == nil {
		t.Error("expected error for invalid transformer expression")
	}

	// transformer that parses but fails at evaluation
	p = Probe{Period: 5, Transformer: "missing + 1"}
	if err := p.Validate(); err == nil {
		t.Error("expected error for transformer with missing parameter")
	}

	// transformer result must be numeric
	p = Probe{Period: 5, Transformer: "v > 1"}
	if err := p.Validate(); err == nil {
		t.Error("expected error for non-numeric transformer result")
	}
}

func TestProbeWithinRange(t *testing.T) {
	t.Parallel()
	p := Probe{Min: 7.8, Max: 8.4}

	if !p.WithinRange(8.0) {
		t.Error("8.0 should be within [7.8, 8.4]")
	}
	if !p.WithinRange(7.8) {
		t.Error("7.8 (boundary) should be within range")
	}
	if !p.WithinRange(8.4) {
		t.Error("8.4 (boundary) should be within range")
	}
	if p.WithinRange(7.7) {
		t.Error("7.7 should be below range")
	}
	if p.WithinRange(8.5) {
		t.Error("8.5 should be above range")
	}
}

func TestNotifyIfNeeded_LowReading(t *testing.T) {
	cap := &alertCapture{}
	p := Probe{
		Name:   "Tank pH",
		Notify: Notify{Enable: true, Min: 7.8, Max: 8.3},
	}
	// low reading triggers alert
	notifyIfNeeded(cap, p, 7.5)
	if cap.subject == "" {
		t.Error("expected alert subject to be set for low reading")
	}
}

func TestNotifyIfNeeded_InRange(t *testing.T) {
	cap := &alertCapture{}
	p := Probe{
		Name:   "Tank pH",
		Notify: Notify{Enable: true, Min: 7.8, Max: 8.3},
	}
	// in-range reading triggers no alert
	notifyIfNeeded(cap, p, 8.0)
	if cap.subject != "" {
		t.Error("expected no alert for in-range reading")
	}
}

func TestNotifyIfNeeded_Disabled(t *testing.T) {
	cap := &alertCapture{}
	p := Probe{
		Name:   "Tank pH",
		Notify: Notify{Enable: false, Min: 7.8, Max: 8.3},
	}
	// notify disabled — no alert
	notifyIfNeeded(cap, p, 8.9)
	if cap.subject != "" {
		t.Error("expected no alert when notify is disabled")
	}
}

func TestProbeCreateFeed(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()
	p := Probe{Name: "FeedTestProbe"}
	p.CreateFeed(c.Telemetry())
}

func setupPHController(t *testing.T) *Controller {
	t.Helper()
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	ctrl := New(true, c)
	if err := ctrl.Setup(); err != nil {
		t.Fatal(err)
	}
	return ctrl
}

func TestPHControllerInUse(t *testing.T) {
	ctrl := setupPHController(t)
	defer ctrl.c.Store().Close()

	// Create a probe referencing equipment "eq1" for UpperEq
	p := Probe{
		Name:        "TestProbe",
		Period:      5,
		AnalogInput: "ain1",
		UpperEq:     "eq1",
		DownerEq:    "eq2",
		IsMacro:     false,
	}
	if err := ctrl.Create(p); err != nil {
		t.Fatal("Create probe failed:", err)
	}

	// InUse for equipment — should find probe via UpperEq
	deps, err := ctrl.InUse("equipment", "eq1")
	if err != nil {
		t.Error("InUse(equipment) error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected dep for UpperEq 'eq1'")
	}

	// InUse for equipment via DownerEq
	deps, err = ctrl.InUse("equipment", "eq2")
	if err != nil {
		t.Error("InUse(equipment) DownerEq error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected dep for DownerEq 'eq2'")
	}

	// InUse for macro type
	deps, err = ctrl.InUse(storage.MacroBucket, "eq1")
	if err != nil {
		t.Error("InUse(macro) should not error:", err)
	}
	if len(deps) != 0 {
		t.Error("Expected no macro deps for non-macro probe")
	}

	// InUse for analog input
	deps, err = ctrl.InUse(storage.AnalogInputBucket, "ain1")
	if err != nil {
		t.Error("InUse(analog_inputs) error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected dep for AnalogInput 'ain1'")
	}

	macroProbe := Probe{
		Name:     "MacroProbe",
		Period:   5,
		UpperEq:  "macro1",
		DownerEq: "macro2",
		IsMacro:  true,
	}
	if err := ctrl.Create(macroProbe); err != nil {
		t.Fatal("Create macro probe failed:", err)
	}
	deps, err = ctrl.InUse(storage.MacroBucket, "macro1")
	if err != nil {
		t.Error("InUse(macro) UpperEq error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected dep for macro UpperEq 'macro1'")
	}
	deps, err = ctrl.InUse(storage.MacroBucket, "macro2")
	if err != nil {
		t.Error("InUse(macro) DownerEq error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected dep for macro DownerEq 'macro2'")
	}

	// InUse for unknown type — should error
	if _, err := ctrl.InUse("unknown", "x"); err == nil {
		t.Error("Expected error for unknown dep type")
	}
}

func TestPHControllerGetEntity(t *testing.T) {
	ctrl := setupPHController(t)
	defer ctrl.c.Store().Close()

	if _, err := ctrl.GetEntity("1"); err == nil {
		t.Error("GetEntity should return error (not supported)")
	}
}

func TestPHControllerSetupLoadsCalibrations(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	ctrl := New(true, c)
	if err := ctrl.Setup(); err != nil {
		t.Fatal(err)
	}
	probe, err := ctrl.repo.Create(Probe{Name: "Calibrated", Period: time.Second})
	if err != nil {
		t.Fatal(err)
	}
	measurements := []hal.Measurement{
		{Expected: 4, Observed: 3.9},
		{Expected: 7, Observed: 7.1},
		{Expected: 10, Observed: 10.2},
	}
	if err := ctrl.repo.SaveCalibration(probe.ID, measurements); err != nil {
		t.Fatal(err)
	}

	reloaded := New(true, c)
	if err := reloaded.Setup(); err != nil {
		t.Fatal(err)
	}
	if _, ok := reloaded.calibrators[probe.ID]; !ok {
		t.Fatal("expected setup to load calibrator")
	}
}

func TestPHControllerSetupReturnsCalibrationError(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	ctrl := New(true, c)
	if err := ctrl.Setup(); err != nil {
		t.Fatal(err)
	}
	probe, err := ctrl.repo.Create(Probe{Name: "BadCalibration", Period: time.Second})
	if err != nil {
		t.Fatal(err)
	}
	measurements := []hal.Measurement{
		{Expected: 4, Observed: 7},
		{Expected: 7, Observed: 7},
		{Expected: 10, Observed: 10},
	}
	if err := ctrl.repo.SaveCalibration(probe.ID, measurements); err != nil {
		t.Fatal(err)
	}

	reloaded := New(true, c)
	if err := reloaded.Setup(); err == nil {
		t.Fatal("expected setup to fail on invalid three point calibration")
	}
}
