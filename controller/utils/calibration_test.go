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
