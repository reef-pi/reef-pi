package utils

import (
	"fmt"
)

type CalibrationType int

const (
	OnePointCalibration CalibrationType = iota + 1
	TwoPointCalibration
)

type Measurement struct {
	Actual   float64 `json:"actual"`
	Expected float64 `json:"expected"`
}

type CalibrationConfiguration struct {
	Type         CalibrationType `json:"Points"`
	Measurements []Measurement   `json:"measurements"`
}

func CalibratorFactory(config CalibrationConfiguration) (Calibrator, error) {
	switch config.Type {
	case OnePointCalibration:
		if len(config.Measurements) != 1 {
			return nil, fmt.Errorf("Expected exactly one measurement. Found: %d", len(config.Measurements))
		}
		return &onePointCalibration{offset: config.Measurements[0].Expected - config.Measurements[0].Actual}, nil
	case TwoPointCalibration:
		if len(config.Measurements) != 2 {
			return nil, fmt.Errorf("Expected exactly one measurement. Found: %d", len(config.Measurements))
		}
		min, max := minMax(config.Measurements[0], config.Measurements[1])
		return &twoPointCalibration{
			refLow:  min.Expected,
			refHigh: max.Expected,
			rawLow:  min.Actual,
			rawHigh: max.Actual,
		}, nil
	default:
		return nil, fmt.Errorf("Expected calibration type can only be 1 or 2. Found: %d", config.Type)
	}
}

func minMax(m1, m2 Measurement) (Measurement, Measurement) {
	if m1.Expected >= m2.Expected {
		return m2, m1
	}
	return m1, m2
}

type twoPointCalibration struct {
	rawLow, rawHigh, refLow, refHigh float64
}

func (c *twoPointCalibration) Calibrate(value float64) float64 {
	fmt.Println(value, c.rawLow, c.rawHigh)
	fmt.Println(value, c.refLow, c.refHigh)
	// CorrectedValue = (((RawValue – RawLow) * ReferenceRange) / RawRange) + ReferenceLow
	return (((value - c.rawLow) * (c.refHigh - c.refLow)) / (c.rawHigh - c.rawLow)) + c.refLow
}

type onePointCalibration struct {
	offset float64
}

func (c *onePointCalibration) Calibrate(value float64) float64 {
	return value + c.offset
}

type Calibrator interface {
	Calibrate(float64) float64
}
