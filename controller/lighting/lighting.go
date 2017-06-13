package lighting

import (
	"fmt"
	"time"
)

type CycleConfig struct {
	Enabled       bool             `json:"enabled"`
	ChannelValues map[string][]int `json:"channel_values"`
}

type FixedConfig map[string]int

type Config struct {
	Fixed       FixedConfig `json:"fixed_config"`
	CycleConfig CycleConfig `json:"cycle_config"`
}

var DefaultConfig = Config{
	CycleConfig: CycleConfig{
		ChannelValues: make(map[string][]int),
	},
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
