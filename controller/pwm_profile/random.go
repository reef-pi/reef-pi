package pwm_profile

import (
	"encoding/json"
	"math/rand"
	"time"
)

const (
	coeff        = 0.1
	seed         = 154
	peakInterval = 360
)

type random struct {
	temporal
	previous     float64
	peaks        []float64
	peakInterval int
}

func (r *random) Name() string {
	return _randomProfileName
}

func Random(conf json.RawMessage, min, max float64) (*random, error) {
	t, err := Temporal(conf, min, max)
	if err != nil {
		return nil, err
	}
	return NewRandom(t), nil
}

func NewRandom(t temporal) *random {
	rand.Seed(seed)
	numPeaks := t.TotalSeconds() / peakInterval
	if numPeaks == 0 {
		numPeaks = 1
	}
	peaks := make([]float64, numPeaks)
	for i, _ := range peaks {
		peaks[i] = rand.Float64()*t.ValueRange() + t.min
	}
	return &random{
		temporal:     t,
		previous:     peaks[0],
		peakInterval: peakInterval,
		peaks:        peaks,
	}
}

func (s *random) Get(t time.Time) float64 {
	if s.IsOutside(t) {
		return 0
	}
	i := s.PastSeconds(t) / s.peakInterval
	prevPeak := s.peaks[i]
	nextPeak := s.peaks[0]
	if (i + 1) < len(s.peaks) {
		nextPeak = s.peaks[i+1]
	}
	f := (nextPeak - prevPeak) / float64(s.peakInterval)
	inc := rand.NormFloat64() + f
	s.previous += inc
	if s.previous > s.max {
		s.previous = s.max
	}
	if s.previous < s.min {
		s.previous = s.min
	}
	s.previous = float64(int(s.previous*100)) / 100
	return s.previous
}
