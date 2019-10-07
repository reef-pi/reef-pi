package pwm_profile

import (
	"encoding/json"
	"math/rand"
	"time"
)

type random struct {
	temporal
	previous     float64
	peaks        []float64
	peakInterval int
}

const coeff = 0.1

func Random(conf json.RawMessage, min, max float64) (*random, error) {
	rand.Seed(154)
	peakInterval := 360
	t, err := Temporal(conf, min, max)
	if err != nil {
		return nil, err
	}
	peaks := make([]float64, t.TotalSeconds()/peakInterval)
	for i, _ := range peaks {
		peaks[i] = rand.Float64()*t.ValueRange() + t.min
	}
	s := random{
		temporal:     t,
		previous:     peaks[0],
		peakInterval: peakInterval,
		peaks:        peaks,
	}
	return &s, nil
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
