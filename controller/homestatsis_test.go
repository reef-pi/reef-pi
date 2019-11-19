package controller

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func testH() (*Homeostasis, error) {
	store, err := storage.TestDB()
	if err != nil {
		return nil, err
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
	h := Homeostasis{
		config: config,
		t:      telemetry.TestTelemetry(store),
		eqs:    NoopSubsystem(),
		macros: NoopSubsystem(),
	}
	return &h, nil
}

func TestHomestasis(t *testing.T) {
	h, err := testH()
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
	h, err := testH()
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
	b, err := eqs.Get(h.config.Upper)
	if err != nil {
		t.Error(err)
	}
	if b {
		t.Error("Expected heater to be turned off")
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
