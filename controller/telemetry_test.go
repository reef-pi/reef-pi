package controller

import (
	"math/rand"
	"os"
	"testing"
	"time"
)

func TestEmitMetric(t *testing.T) {
	token := os.Getenv("AIO_KEY")
	if token == "" {
		t.Fatal("Please set adafruit.io key")
	}
	config := AdafruitIO{
		Token:   token,
		Enabled: true,
		User:    "ranjib",
		Feed:    "temperature",
	}
	telemetry := NewTelemetry(config)
	rand.Seed(time.Now().Unix())
	telemetry.EmitMetric(rand.Intn(100))
}
