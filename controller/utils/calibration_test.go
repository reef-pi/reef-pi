package utils

import (
	"math"
	"testing"
)

func TestCalibration(t *testing.T) {
	conf := CalibrationConfiguration{
		Type:         OnePointCalibration,
		Measurements: []Measurement{{Actual: 10, Expected: 12}},
	}
	c, err := CalibratorFactory(conf)
	if err != nil {
		t.Error(err)
	}
	if c.Calibrate(19) != 21 {
		t.Error("Expected: 21, Found:", c.Calibrate(19))
	}
	conf = CalibrationConfiguration{
		Type: TwoPointCalibration,
		Measurements: []Measurement{
			{Actual: -0.5, Expected: 0.01},
			{Actual: 96.0, Expected: 100},
		},
	}

	c1, err := CalibratorFactory(conf)
	if err != nil {
		t.Error(err)
	}

	if (math.Round(c1.Calibrate(37)*10) / 10) != 38.9 {
		t.Error("Expected 38.9, found:", c1.Calibrate(37))
	}
}

func TestCalibratorFactoryErrors(t *testing.T) {
	// Unknown type
	_, err := CalibratorFactory(CalibrationConfiguration{Type: 99})
	if err == nil {
		t.Error("Expected error for unknown calibration type")
	}

	// OnePoint with wrong measurement count
	_, err = CalibratorFactory(CalibrationConfiguration{
		Type:         OnePointCalibration,
		Measurements: []Measurement{{}, {}},
	})
	if err == nil {
		t.Error("Expected error for OnePoint with 2 measurements")
	}

	// TwoPoint with wrong measurement count
	_, err = CalibratorFactory(CalibrationConfiguration{
		Type:         TwoPointCalibration,
		Measurements: []Measurement{{}},
	})
	if err == nil {
		t.Error("Expected error for TwoPoint with 1 measurement")
	}

	// TwoPoint where m1.Expected >= m2.Expected (exercises minMax swap branch)
	c, err := CalibratorFactory(CalibrationConfiguration{
		Type: TwoPointCalibration,
		Measurements: []Measurement{
			{Actual: 96.0, Expected: 100},
			{Actual: -0.5, Expected: 0.01},
		},
	})
	if err != nil {
		t.Error("Unexpected error:", err)
	}
	_ = c.Calibrate(50)
}
