package pwm_profile

import (
	"encoding/json"
	"math"
	"testing"
	"time"
)

func TestCyclic(t *testing.T) {
	conf, _ := json.Marshal(map[string]interface{}{
		"period":      60.0, // 60-second cycle
		"phase_shift": 0.0,
	})
	c, err := Cyclic(conf, 20, 80)
	if err != nil {
		t.Fatal("unexpected error:", err)
	}
	if c.Name() != _cyclicProfileName {
		t.Errorf("expected name %q, got %q", _cyclicProfileName, c.Name())
	}

	// At t=0 (unix epoch), sin(0)=0, so value should be midpoint = min + 0.5*(max-min) = 50
	// Actually sin(0)=0, (0+1)/2 = 0.5, so value = 20 + 0.5*60 = 50
	t0 := time.Unix(0, 0).UTC()
	v0 := c.Get(t0)
	if math.Abs(v0-50) > 0.001 {
		t.Errorf("expected ~50 at t=0, got %.4f", v0)
	}

	// At t = period/4 = 15s, sin(π/2)=1, value should be max = 80
	t1 := time.Unix(15, 0).UTC()
	v1 := c.Get(t1)
	if math.Abs(v1-80) > 0.001 {
		t.Errorf("expected ~80 at t=period/4, got %.4f", v1)
	}

	// At t = period/2 = 30s, sin(π)=0, value should be midpoint = 50
	t2 := time.Unix(30, 0).UTC()
	v2 := c.Get(t2)
	if math.Abs(v2-50) > 0.001 {
		t.Errorf("expected ~50 at t=period/2, got %.4f", v2)
	}

	// At t = 3*period/4 = 45s, sin(3π/2)=-1, value should be min = 20
	t3 := time.Unix(45, 0).UTC()
	v3 := c.Get(t3)
	if math.Abs(v3-20) > 0.001 {
		t.Errorf("expected ~20 at t=3*period/4, got %.4f", v3)
	}
}

func TestCyclicPhaseShift(t *testing.T) {
	// With 50% phase shift, the wave is inverted relative to no phase shift
	conf, _ := json.Marshal(map[string]interface{}{
		"period":      60.0,
		"phase_shift": 25.0, // 25% = 15 seconds offset
	})
	c, err := Cyclic(conf, 0, 100)
	if err != nil {
		t.Fatal("unexpected error:", err)
	}

	// At t=0 with 15s phase shift, equivalent to t=-15 → sin(-π/2) = -1 → value = 0
	t0 := time.Unix(0, 0).UTC()
	v0 := c.Get(t0)
	if math.Abs(v0-0) > 0.001 {
		t.Errorf("expected ~0 at t=0 with 25%% phase, got %.4f", v0)
	}
}

func TestCyclicValidation(t *testing.T) {
	tests := []struct {
		name    string
		period  float64
		phase   float64
		min     float64
		max     float64
		wantErr bool
	}{
		{"valid", 60, 0, 10, 90, false},
		{"zero period", 0, 0, 10, 90, true},
		{"negative period", -1, 0, 10, 90, true},
		{"phase >= 100", 60, 100, 10, 90, true},
		{"negative phase", 60, -1, 10, 90, true},
		{"min >= max", 60, 0, 90, 10, true},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			conf, _ := json.Marshal(map[string]interface{}{
				"period":      tc.period,
				"phase_shift": tc.phase,
			})
			_, err := Cyclic(conf, tc.min, tc.max)
			if tc.wantErr && err == nil {
				t.Error("expected error, got nil")
			}
			if !tc.wantErr && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}
