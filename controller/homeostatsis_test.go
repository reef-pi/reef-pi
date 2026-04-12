package controller

import (
	"errors"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func testH() (*Homeostasis, storage.Store, error) {
	store, err := storage.TestDB()
	if err != nil {
		return nil, nil, err
	}
	config := HomeoStasisConfig{
		Name:       "test",
		Upper:      "1",
		Downer:     "2",
		Min:        10,
		Max:        30,
		Period:     2,
		Hysteresis: 0,
	}
	sub := NoopSubsystem()
	h := Homeostasis{
		config: config,
		t:      telemetry.TestTelemetry(store),
		eqs:    sub,
		macros: sub,
	}
	return &h, store, nil
}

func TestHomestasis(t *testing.T) {
	h, store, err := testH()
	defer store.Close()
	if err != nil {
		t.Fatal(err)
	}
	o := Observation{
		Value: 21,
	}
	if err := h.Sync(&o); err != nil {
		t.Error(err)
	}
	if o.Upper != 0 {
		t.Error("Upper should not increase when value is within range")

	}
	if o.Downer != 0 {
		t.Error("Downer should not increase when value is within range")
	}
	o.Value = 35
	if err := h.Sync(&o); err != nil {
		t.Error(err)
	}
	if o.Upper != 0 {
		t.Error("Upper should not increase when value is above range")

	}
	if o.Downer != 2 {
		t.Error("Downer should increase when value is above range")
	}
	o.Value = 5
	if err := h.Sync(&o); err != nil {
		t.Error(err)
	}
	if o.Upper != 2 {
		t.Error("Upper should increase when value is below range")

	}
	if o.Downer != 2 {
		t.Error("Downer should not increase when value is below range")
	}

}

func TestHysteresis(t *testing.T) {
	h, store, err := testH()
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}
	h.config.Min = 76
	h.config.Max = 81
	h.config.Downer = ""
	h.config.Hysteresis = 0.2
	eqs := NoopSubsystem()
	h.eqs = eqs
	o := Observation{
		Value: 83,
	}
	if err := h.Sync(&o); err != nil {
		t.Error(err)
	}
	if o.Upper != 0 {
		t.Error("Upper should not increase when value is within range")

	}
	if o.Downer != 0 {
		t.Error("Downer should not increase when value is within range")
	}
	if _, err := eqs.Get(h.config.Upper); err != nil {
		t.Error(err)
	}
}

func TestNewHomeostasis(t *testing.T) {
	c, err := TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	config := HomeoStasisConfig{
		Name:       "test-h",
		Upper:      "1",
		Downer:     "2",
		Min:        10,
		Max:        30,
		Period:     2,
		Hysteresis: 0.5,
	}
	h := NewHomeostasis(c, config)
	if h == nil {
		t.Fatal("Expected non-nil Homeostasis")
	}
	if h.config.Name != "test-h" {
		t.Errorf("Expected config name 'test-h', got '%s'", h.config.Name)
	}
	// IsMacro=false → Sub() should return eqs subsystem
	sub := h.Sub()
	if sub == nil {
		t.Error("Expected non-nil subsystem from Sub()")
	}

	// IsMacro=true → Sub() should return macros subsystem
	h.config.IsMacro = true
	sub2 := h.Sub()
	if sub2 == nil {
		t.Error("Expected non-nil macro subsystem from Sub()")
	}
}

func TestBasicErrJoin(t *testing.T) {
	e1 := errors.New("first error")
	e2 := errors.New("second error")

	// prevErr is nil → result is just newErr
	result := BasicErrJoin(nil, e2)
	if result != e2 {
		t.Errorf("Expected result to be e2 when prevErr is nil, got: %v", result)
	}

	// prevErr is non-nil → result wraps newErr and includes prevErr
	result2 := BasicErrJoin(e1, e2)
	if result2 == nil {
		t.Fatal("Expected non-nil error")
	}
	if result2.Error() == "" {
		t.Error("Expected non-empty error message")
	}
	// result2 should unwrap to e2 (the new error is wrapped)
	if !errors.Is(result2, e2) {
		t.Errorf("Expected result2 to wrap e2, got: %v", result2)
	}
}

func TestObservation(t *testing.T) {
	o1 := NewObservation(1.2)
	o2 := NewObservation(1.2)
	_, u1 := o1.Rollup(o2)
	if u1 {
		t.Error("Metric should not be updated if they are not more than an hour apart")
	}
	o1.Time = telemetry.TeleTime(time.Now().Add(-2 * time.Hour))
	_, u2 := o1.Rollup(o2)
	if !u2 {
		t.Error("Metric should be updated if they are more than an hour apart")
	}
	if !o1.Before(o2) {
		t.Error("Observation should be sorted by their time")
	}
}
