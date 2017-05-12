package lighting

import (
	"fmt"
	"math"
	"time"
)

type CycleConfig struct {
	Intensities []int `json:"intensities"` // For cycle
	Spectrums   []int `json:"spectrums"`   // For cycle
	Enabled     bool  `json:"enabled"`
}

type FixedConfig struct {
	Intensity int `json:"intensity"` // For fixed spectrum
	Spectrum  int `json:"value"`     // For fixed spectrum
}

type Config struct {
	Fixed       FixedConfig `json:"fixed_config"`
	CycleConfig CycleConfig `json:"cycle_config"`
}

var DefaultConfig = Config{
	CycleConfig: CycleConfig{
		Intensities: make([]int, 12),
		Spectrums:   make([]int, 12),
	},
}

type Intensity struct {
	Value int `json:"value"`
}

type Spectrum struct {
	Value int `json:"value"`
}

func ValidateValues(values []int) error {
	if len(values) != 12 {
		return fmt.Errorf("Expect 12 values instead of: %d", len(values))
	}
	for i, v := range values {
		if (v < 0) || (v > 100) {
			return fmt.Errorf(" value %d on index %d is out of range (0-99)", v, i)
		}
	}
	return nil
}

func GetCurrentValue(t time.Time, series []int) int {
	h1 := (t.Hour() / 2) - 1
	if h1 == -1 {
		h1 = 11
	}
	h2 := h1 + 1
	if h2 >= 12 {
		h2 = 0
	}
	m := t.Minute()
	from := series[h1]
	to := series[h2]
	f := float64(from) + (((float64(to) - float64(from)) / 120.0) * float64(m))
	return int(math.Ceil(f - 0.5))
}
