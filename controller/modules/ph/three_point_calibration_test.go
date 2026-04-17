package ph

import (
	"math"
	"testing"

	"github.com/reef-pi/hal"
)

func TestNewThreePointCalibrator_errors(t *testing.T) {
	if _, err := newThreePointCalibrator(nil); err == nil {
		t.Error("expected error for nil slice")
	}
	if _, err := newThreePointCalibrator([]hal.Measurement{{Expected: 4, Observed: 4}, {Expected: 7, Observed: 7}}); err == nil {
		t.Error("expected error for only 2 points")
	}
	// duplicate observed values
	_, err := newThreePointCalibrator([]hal.Measurement{
		{Expected: 4, Observed: 4},
		{Expected: 7, Observed: 4},
		{Expected: 10, Observed: 10},
	})
	if err == nil {
		t.Error("expected error for duplicate observed values")
	}
}

func TestThreePointCalibrator_perfectLinear(t *testing.T) {
	// When expected == observed, calibration should be identity
	c, err := newThreePointCalibrator([]hal.Measurement{
		{Expected: 4, Observed: 4},
		{Expected: 7, Observed: 7},
		{Expected: 10, Observed: 10},
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, v := range []float64{4.0, 5.5, 7.0, 8.5, 10.0} {
		got := c.Calibrate(v)
		if math.Abs(got-v) > 1e-9 {
			t.Errorf("Calibrate(%v) = %v, want %v", v, got, v)
		}
	}
}

func TestThreePointCalibrator_piecewiseInterpolation(t *testing.T) {
	// Low segment: observed [3..6] -> expected [4..7]  (slope = 1, offset = +1)
	// High segment: observed [6..9] -> expected [7..10] (slope = 1, offset = +1)
	c, err := newThreePointCalibrator([]hal.Measurement{
		{Expected: 4, Observed: 3},
		{Expected: 7, Observed: 6},
		{Expected: 10, Observed: 9},
	})
	if err != nil {
		t.Fatal(err)
	}
	cases := []struct {
		observed float64
		expected float64
	}{
		{3.0, 4.0},
		{4.5, 5.5},
		{6.0, 7.0},
		{7.5, 8.5},
		{9.0, 10.0},
	}
	for _, tc := range cases {
		got := c.Calibrate(tc.observed)
		if math.Abs(got-tc.expected) > 1e-9 {
			t.Errorf("Calibrate(%v) = %v, want %v", tc.observed, got, tc.expected)
		}
	}
}

func TestThreePointCalibrator_sortsByObserved(t *testing.T) {
	// Points supplied out of order — should still work
	c, err := newThreePointCalibrator([]hal.Measurement{
		{Expected: 10, Observed: 9},
		{Expected: 4, Observed: 3},
		{Expected: 7, Observed: 6},
	})
	if err != nil {
		t.Fatal(err)
	}
	got := c.Calibrate(6.0)
	if math.Abs(got-7.0) > 1e-9 {
		t.Errorf("Calibrate(6) = %v, want 7", got)
	}
}
