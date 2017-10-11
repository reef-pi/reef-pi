package temperature

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"time"
)

type Config struct {
	Min           float32       `yaml:"min" json:"min"`
	Max           float32       `yaml:"max" json:"max"`
	CheckInterval time.Duration `yaml:"check_interval" json:"check_interval"`
	Heater        string        `yaml:"heater" json:"heater"`
	Cooler        string        `yaml:"cooler" json:"cooler"`
	Control       bool          `yaml:"control" json:"control"`
	Enable        bool          `yaml:"enable" json:"enable"`
	DevMode       bool          `yaml:"dev_mode" json:"dev_mode"`
}

var DefaultConfig = Config{
	Min:           77,
	Max:           81,
	CheckInterval: 1,
}

func loadConfig(store utils.Store) (Config, error) {
	var conf Config
	return conf, store.Get(Bucket, "config", &conf)
}

func saveConfig(store utils.Store, conf Config) error {
	if conf.CheckInterval <= 0 {
		return fmt.Errorf("check interval has to ve positive")
	}
	return store.Update(Bucket, "config", conf)
}
