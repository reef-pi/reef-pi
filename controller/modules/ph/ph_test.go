package ph

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
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
		Name:     "TestProbe",
		Period:   5,
		UpperEq:  "eq1",
		DownerEq: "eq2",
		IsMacro:  false,
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
	_, err = ctrl.InUse("macro", "eq1")
	if err != nil {
		t.Error("InUse(macro) should not error:", err)
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
