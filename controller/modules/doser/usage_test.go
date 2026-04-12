package doser

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func TestDoserUsage(t *testing.T) {
	t.Parallel()
	t1 := time.Now()

	u1 := Usage{
		Pump: 2,
		Time: telemetry.TeleTime(t1),
	}
	u2 := Usage{
		Pump: 3,
		Time: telemetry.TeleTime(t1.Add(24 * time.Hour)),
	}

	// u1 before u2
	if !u1.Before(u2) {
		t.Error("u1 should be before u2")
	}

	// Rollup across different days should return u2 and signal next bucket
	result, next := u1.Rollup(u2)
	if !next {
		t.Error("expected next=true for different day rollup")
	}
	if result.(Usage).Pump != u2.Pump {
		t.Error("expected rolled-up value to be u2")
	}

	// Rollup on same day should accumulate pump counts
	u3 := Usage{
		Pump: 5,
		Time: telemetry.TeleTime(t1),
	}
	result, next = u1.Rollup(u3)
	if next {
		t.Error("expected next=false for same-day rollup")
	}
	if result.(Usage).Pump != u1.Pump+u3.Pump {
		t.Errorf("expected accumulated pump=%d, got %d", u1.Pump+u3.Pump, result.(Usage).Pump)
	}
}
