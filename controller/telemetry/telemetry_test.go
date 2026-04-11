package telemetry

import (
	"testing"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestEmitMetric(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	tele := TestTelemetry(store)
	tele.EmitMetric("test", "foo", 1.23)
	tele.config.Throttle = 2
	sent, err := tele.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if !sent {
		t.Error("Test alert not sent")
	}
	sent, err = tele.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if !sent {
		t.Error("Test alert not sent")
	}
	sent, err = tele.Alert("test-alert", "")
	if err != nil {
		t.Error(err)
	}
	if sent {
		t.Error("Test alert not being throttled")
	}
}

func TestNewTelemetry(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	store.CreateBucket("telemetry")
	lr := func(_, _ string) error { return nil }
	tel := NewTelemetry("reef-pi", "telemetry", store, DefaultTelemetryConfig, lr)
	if tel == nil {
		t.Fatal("Expected non-nil telemetry")
	}
}

func TestInitialize(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	store.CreateBucket("telemetry")
	lr := func(_, _ string) error { return nil }
	tel := Initialize("reef-pi", "telemetry", store, lr, false)
	if tel == nil {
		t.Fatal("Expected non-nil telemetry from Initialize")
	}
}

func TestLogError(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	tele := TestTelemetry(store)
	if err := tele.LogError("module", "something went wrong"); err != nil {
		t.Error("LogError should not fail with noop logError:", err)
	}
}

func TestSanitizeAdafruitIOFeedName(t *testing.T) {
	cases := []struct {
		input, expected string
	}{
		{"pH sensor", "ph-sensor"},
		{"Temperature", "temperature"},
		{"Alk Weekly", "alk-weekly"},
		{"already-lower", "already-lower"},
	}
	for _, c := range cases {
		if got := SanitizeAdafruitIOFeedName(c.input); got != c.expected {
			t.Errorf("SanitizeAdafruitIOFeedName(%q) = %q, want %q", c.input, got, c.expected)
		}
	}
}

func TestEmitMQTTWithoutClient(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	tele := TestTelemetry(store)
	// mClient is nil — should return an error
	if err := tele.EmitMQTT("topic", 1.0); err == nil {
		t.Error("Expected error when MQTT client is not initialized")
	}
}

func TestEmitMetricWithPrometheus(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	tele := TestTelemetry(store)
	tele.config.Prometheus = true
	tele.pMs = make(map[string]prometheus.Gauge)

	// First call registers the gauge; second call reuses it
	tele.EmitMetric("test", "prom_metric", 1.0)
	tele.EmitMetric("test", "prom_metric", 2.0)
}

func TestApplyConfig(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	tele := TestTelemetry(store)
	// Apply a config with Notify enabled — exercises the non-noop mailer path
	c := DefaultTelemetryConfig
	c.Notify = true
	tele.applyConfig(c)

	// Apply a config with Notify disabled
	c.Notify = false
	tele.applyConfig(c)
}

func TestSanitizePrometheusMetricName(t *testing.T) {
	checks := []struct {
		input  string
		output string
	}{
		{
			input:  "abc",
			output: "abc",
		},
		{
			input:  "abc-123",
			output: "abc_123",
		},
		{
			input:  "",
			output: "",
		},
		{
			input:  "ABC",
			output: "abc",
		},
		{
			input:  "abc/123/Four-Five",
			output: "abc_123_four_five",
		},
	}
	for _, c := range checks {
		out := SanitizePrometheusMetricName(c.input)
		if out != c.output {
			t.Errorf("metric name not sanitized: input '%s', output '%s', expected '%s'", c.input, out, c.output)
		}
	}
}
