package ph

import (
	"fmt"
	"sort"

	"github.com/reef-pi/hal"
)

// threePointCalibrator performs piecewise linear calibration using three reference points.
// The observed range is split at the middle point; each half uses its own linear mapping.
type threePointCalibrator struct {
	points [3]hal.Measurement // sorted by Observed ascending
}

func newThreePointCalibrator(measurements []hal.Measurement) (*threePointCalibrator, error) {
	if len(measurements) != 3 {
		return nil, fmt.Errorf("three-point calibration requires exactly 3 points, got %d", len(measurements))
	}
	pts := make([]hal.Measurement, 3)
	copy(pts, measurements)
	sort.Slice(pts, func(i, j int) bool {
		return pts[i].Observed < pts[j].Observed
	})
	if pts[0].Observed == pts[1].Observed || pts[1].Observed == pts[2].Observed {
		return nil, fmt.Errorf("three-point calibration requires distinct observed values")
	}
	var c threePointCalibrator
	c.points[0] = pts[0]
	c.points[1] = pts[1]
	c.points[2] = pts[2]
	return &c, nil
}

func (c *threePointCalibrator) Calibrate(v float64) float64 {
	var lo, hi hal.Measurement
	if v <= c.points[1].Observed {
		lo, hi = c.points[0], c.points[1]
	} else {
		lo, hi = c.points[1], c.points[2]
	}
	dObs := hi.Observed - lo.Observed
	if dObs == 0 {
		return lo.Expected
	}
	slope := (hi.Expected - lo.Expected) / dObs
	return lo.Expected + slope*(v-lo.Observed)
}
