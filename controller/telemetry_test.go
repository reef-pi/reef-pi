package controller

import (
	"math/rand"
	"testing"
	"time"
)

func TestEmitMetric(t *testing.T) {
	config := AdafruitIO{
		Token:   "fake-token",
		Enabled: false,
		User:    "ranjib",
		Feed:    "temperature",
	}
	telemetry := NewTelemetry(config)
	rand.Seed(time.Now().Unix())

	telemetry.EmitMetric("test", rand.Intn(100))
}
