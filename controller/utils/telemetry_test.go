package utils

import (
	"math/rand"
	"testing"
	"time"
)

func TestEmitMetric(t *testing.T) {
	telemetry := TestTelemetry()
	rand.Seed(time.Now().Unix())
	telemetry.EmitMetric("test", rand.Intn(100))
}
