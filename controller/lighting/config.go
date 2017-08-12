package lighting

import (
	"time"
)

type Cycle struct {
	Enable        bool             `json:"enable"`
	ChannelValues map[string][]int `json:"channels"`
}

type Channel struct {
	Pin          int `yaml:"pin"`
	MinTheshold  int `yaml:"min"`
	MaxThreshold int `yaml:"max"`
}

type Fixed map[string]int

type Config struct {
	Enable   bool               `yaml:"enable"`
	DevMode  bool               `yaml:"dev_mode"`
	Channels map[string]Channel `yaml:"channels"`
	Cycle    Cycle              `yaml:"cycle"`
	Fixed    Fixed              `yaml:"fixed"`
	Interval time.Duration      `yaml:"interval"`
}

var DefaultConfig = Config{
	Fixed: make(map[string]int),
	Cycle: Cycle{
		ChannelValues: make(map[string][]int),
	},
	Interval: 15 * time.Second,
}
