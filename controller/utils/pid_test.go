package utils

import (
	"testing"
)

func TestPID(t *testing.T) {
	pid := NewPID(0.5, 0, 0)
	pid.Setpoint = 10 // i = 5 o=2.5
	o := pid.UpdateDuration(5, 0)
	if o != 2.5 {
		t.Error("Expected: 2.5, Found:", o)
	}
}
