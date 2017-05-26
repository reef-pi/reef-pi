package controller

import (
	"github.com/ranjib/adafruitio"
	"log"
)

func (c *Controller) DumpTelemetry() {
	log.Println("Telemtry informarion")
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

func (t *Telemetry) EmitMetric(v int) {
	d := adafruitio.Data{
		Value: v,
	}

	if t.config.Enabled {
		if err := t.client.SubmitData(t.config.User, t.config.Feed, d); err != nil {
			log.Println("ERROR: Failed to submit data to adafruit.io. Error:", err)
		}
	}
}
