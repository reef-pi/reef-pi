package lighting

import (
	"fmt"
	"time"
)

type CycleConfig struct {
	Enabled       bool             `json:"enabled"`
	ChannelValues map[string][]int `json:"channels"`
}

type FixedConfig map[string]int

type Config struct {
	Fixed FixedConfig `json:"fixed_config"`
	Cycle CycleConfig `json:"cycle_config"`
}

var defaultConfig = Config{
	Fixed: make(map[string]int),
	Cycle: CycleConfig{
		ChannelValues: make(map[string][]int),
	},
}

func DefaultConfig(channels map[string]int) Config {
	fixed := make(map[string]int)
	cycles := make(map[string][]int)
	for ch, _ := range channels {
		fixed[ch] = 0
		cycles[ch] = make([]int, 12, 12)
	}
	c := Config{
		Fixed: fixed,
		Cycle: CycleConfig{
			ChannelValues: cycles,
		},
	}
	return c
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
	h1 := t.Hour() / 2
	h2 := h1 + 1
	if h2 >= 12 {
		h2 = 0
	}
	m := float64(t.Minute() + ((t.Hour() % 2) * 60))
	from := float64(series[h1])
	to := float64(series[h2])
	f := from + ((to - from) / 120.0 * m)
	fmt.Println("h1:", h1, "h2:", h2, "from:", from, "to:", to, "m:", m, "f:", f)
	return int(f)
}
