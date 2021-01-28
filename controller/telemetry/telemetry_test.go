package telemetry

import (
	"testing"

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
