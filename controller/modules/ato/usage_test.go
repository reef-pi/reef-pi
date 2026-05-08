package ato

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func TestUsage(t *testing.T) {
	t.Parallel()
	t1 := time.Now()
	u1 := Usage{
		Pump: 2,
		Time: telemetry.TeleTime(t1),
	}

	u2 := Usage{
		Pump: 3,
		Time: telemetry.TeleTime(t1.Add(2 * time.Hour)),
	}

	if !u1.Before(u2) {
		t.Error(u1, "should be before", u2)
	}
	result, next := u1.Rollup(u2)
	if !next {
		t.Error("expected next=true for next-hour rollup")
	}
	if result.(Usage).Pump != u2.Pump {
		t.Errorf("expected rolled-up pump=%d, got %d", u2.Pump, result.(Usage).Pump)
	}
	u2.Time = u1.Time
	result, next = u1.Rollup(u2)
	if next {
		t.Error("expected next=false for same-hour rollup")
	}
	if result.(Usage).Pump != u1.Pump+u2.Pump {
		t.Errorf("expected accumulated pump=%d, got %d", u1.Pump+u2.Pump, result.(Usage).Pump)
	}
}
