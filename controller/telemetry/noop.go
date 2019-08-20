package telemetry

import (
	"github.com/reef-pi/reef-pi/controller/storage"
	"sync"
)

func TestTelemetry(store storage.Store) *telemetry {
	c := TelemetryConfig{
		AdafruitIO: AdafruitIO{
			User: "test-user",
		},
		CurrentLimit:    CurrentLimit,
		HistoricalLimit: HistoricalLimit,
	}
	return &telemetry{
		config:     c,
		dispatcher: &NoopMailer{},
		aStats:     make(map[string]AlertStats),
		mu:         &sync.Mutex{},
		logError:   func(_, _ string) error { return nil },
		store:      store,
		bucket:     "telemetry",
	}
}
