package lighting

import (
	"time"
)

type Jack struct {
	ID   string `json:"id" yaml:"id"`
	Name string `json:"name" yaml:"name"`
	Pins []int  `json:"pins" yaml:"pins"`
}

type Channel struct {
	Name         string `json:"name" yaml:"name"`
	Pin          int    `json:"pin" yaml:"pin"`
	Reverse      bool   `json:"reverse" yaml:"reverse"`
	MinTheshold  int    `json:"min" yaml:"min"`
	MaxThreshold int    `json:"max" yaml:"max"`
	Ticks        int    `json:"ticks" yaml:"ticks"`
	Values       []int  `json:"values" yaml:"values"`
	Fixed        int    `json:"fixed" yaml:"fixed"`
	Auto         bool   `json:"auto" yaml:"auto"`
}

type Config struct {
	DevMode  bool          `json:"dev_mode" yaml:"dev_mode"`
	Interval time.Duration `json:"interval" yaml:"interval"`
}

var DefaultConfig = Config{
	Interval: 15 * time.Second,
}
