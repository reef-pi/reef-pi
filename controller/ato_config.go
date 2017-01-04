package controller

import (
	"encoding/json"
	"time"
)

const (
	ATOCONFIG_BUKET = "ato_configs"
)

type ATOConfig struct {
	ID        string        `json:"id"`
	Name      string        `json:"name"`
	SensorPin int           `json:"sensor_pin"`
	PumpPin   int           `json:"pump_pin"`
	Frequency time.Duration `json:"frequency"`
	HighRelay bool          `json:"high_relay"`
}

func (c *Controller) GetATOConfig(id string) (ATOConfig, error) {
	var config ATOConfig
	return config, c.store.Get(ATOCONFIG_BUKET, id, &config)
}

func (c *Controller) ListATOConfigs() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var config ATOConfig
		return &config, json.Unmarshal(v, &config)
	}
	return c.store.List(ATOCONFIG_BUKET, fn)
}

func (c *Controller) CreateATOConfig(config ATOConfig) error {
	fn := func(id string) interface{} {
		config.ID = id
		return config
	}
	return c.store.Create(ATOCONFIG_BUKET, fn)
}

func (c *Controller) UpdateATOConfig(id string, payload ATOConfig) error {
	return c.store.Update(ATOCONFIG_BUKET, id, payload)
}

func (c *Controller) DeleteATOConfig(id string) error {
	return c.store.Delete(ATOCONFIG_BUKET, id)
}
