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

func (t *Telemetry) EmitDefaultMetric(v int) {
	d := adafruitio.Data{
		Value: v,
	}

	if !t.config.Enabled {
		log.Println("Telemetry disabled. Skipping emitting", v, "on", t.config.Feed)
		return
	}
	if err := t.client.SubmitData(t.config.User, t.config.Feed, d); err != nil {
		log.Println("ERROR: Failed to submit data to adafruit.io. Error:", err)
	}
}

func (t *Telemetry) EmitMetric(feed string, v int) {
	d := adafruitio.Data{
		Value: v,
	}

	if !t.config.Enabled {
		log.Println("Telemetry disabled. Skipping emitting", v, "on", feed)
		return
	}
	if err := t.client.SubmitData(t.config.User, feed, d); err != nil {
		log.Println("ERROR: Failed to submit data to adafruit.io. User: ", t.config.User, "Feed:", feed, "Error:", err)
	}
}
