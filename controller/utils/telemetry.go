package utils

import (
	"github.com/reef-pi/adafruitio"
	"log"
	"strings"
)

type AdafruitIO struct {
	Enable bool   `json:"enable" yaml:"enable"`
	Token  string `json:"token" yaml:"token"`
	User   string `json:"user" yaml:"user"`
	Prefix string `json:"prefix" yaml:"prefix"`
}

type Telemetry struct {
	client *adafruitio.Client
	config AdafruitIO
}

func NewTelemetry(config AdafruitIO) *Telemetry {
	return &Telemetry{
		client: adafruitio.NewClient(config.Token),
		config: config,
	}
}

func (t *Telemetry) EmitMetric(feed string, v interface{}) {
	d := adafruitio.Data{
		Value: v,
	}
	feed = strings.ToLower(t.config.Prefix + feed)

	if !t.config.Enable {
		log.Println("Telemetry disabled. Skipping emitting", v, "on", feed)
		return
	}
	if err := t.client.SubmitData(t.config.User, feed, d); err != nil {
		log.Println("ERROR: Failed to submit data to adafruit.io. User: ", t.config.User, "Feed:", feed, "Error:", err)
	}
}
