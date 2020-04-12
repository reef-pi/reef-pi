package pwm_profile

import (
	"testing"
	"time"
)

func TestTemporal(t *testing.T) {
	if _, err := Temporal([]byte(""), 13, 100); err == nil {
		t.Error("bogus config should fail")
	}

	conf := `{"start":"10:00:00","end": "19:00"}`
	if _, err := Temporal([]byte(conf), 13, 100); err == nil {
		t.Error("bogus config should fail")
	}
	conf = `{"start":"10:00:00","end": "19:30:00"}`
	if _, err := Temporal([]byte(conf), -1, 100); err == nil {
		t.Error("bogus config should fail")
	}
	if _, err := Temporal([]byte(conf), 13, 110); err == nil {
		t.Error("bogus config should fail")
	}

	p, err := Temporal([]byte(conf), 13, 100)
	if err != nil {
		t.Fatal(err)
	}

	if p.ValueRange() != 87 {
		t.Error("Expected 87, found:", p.ValueRange())
	}

	if p.TotalMinutes() != 570 {
		t.Error("Expected 570, found:", p.TotalMinutes())
	}

	if n := p.PastMinutes(time.Now()); n == 0 {
		t.Error("Expected non-zero, found:", n)
	}

	if !p.AdjustBounds(14, 90) {
		t.Error("Bounds should be updated")
	}
}
