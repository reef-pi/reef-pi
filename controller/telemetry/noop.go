package telemetry

import "sync"

func TestTelemetry() *telemetry {
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
	}
}
