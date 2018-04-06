package temperature

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"time"
)

type Notify struct {
	Enable bool    `json:"enable"`
	Min    float32 `json:"min"`
	Max    float32 `json:"max"`
}
type Config struct {
	Min           float32       `json:"min"`
	Max           float32       `json:"max"`
	CheckInterval time.Duration `json:"check_interval"`
	Heater        string        `json:"heater"`
	Cooler        string        `json:"cooler"`
	Control       bool          `json:"control"`
	Enable        bool          `json:"enable"`
	DevMode       bool          `json:"dev_mode"`
	Notify        Notify        `json:"notify"`
}

var DefaultConfig = Config{
	Min:           77,
	Max:           81,
	CheckInterval: 1,
	Notify:        Notify{Min: 76, Max: 82},
}

func loadConfig(store utils.Store) (Config, error) {
	var conf Config
	return conf, store.Get(Bucket, "config", &conf)
}

func (c *Controller) NotifyIfNeeded(reading float32) {
	if !c.config.Notify.Enable {
		return
	}
	subject := "[Reef-Pi ALERT] temperature out of range"
	format := "Current temperature (%f) is out of acceptable range ( %f -%f )"
	body := fmt.Sprintf(format, reading, c.config.Notify.Min, c.config.Notify.Max)
	if reading >= c.config.Notify.Max {
		c.telemetry.Alert(subject, "Tank is running hot."+body)
		return
	}
	if reading <= c.config.Notify.Min {
		c.telemetry.Alert(subject, "Tank is running cold."+body)
		return
	}
}

func saveConfig(store utils.Store, conf Config) error {
	if conf.CheckInterval <= 0 {
		return fmt.Errorf("check interval has to ve positive")
	}
	return store.Update(Bucket, "config", conf)
}
