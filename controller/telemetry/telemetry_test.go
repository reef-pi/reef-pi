package telemetry

import (
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/reef-pi/adafruitio"
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

// https://github.com/reef-pi/reef-pi/issues/1996
func TestSanitizeAdafruitIOFeedName(t *testing.T) {
	checks := []struct {
		input  string
		output string
	}{
		{input: "simple", output: "simple"},
		{input: "with space", output: "with-space"},
		// parentheses must be stripped (caused "invalid URL" on adafruit.io)
		{input: "rpato-auto-fill-(ato)-state", output: "rpato-auto-fill-ato-state"},
		// colon must be stripped
		{input: "rpato-alarm:-water-high", output: "rpato-alarm-water-high"},
		// consecutive dashes from stripped characters collapse to one
		{input: "rpdaylight---sera-(30w)-led", output: "rpdaylight-sera-30w-led"},
		// leading/trailing hyphens trimmed
		{input: "(foo)", output: "foo"},
		// uppercase is lowercased
		{input: "MyFeed", output: "myfeed"},
	}
	for _, c := range checks {
		out := SanitizeAdafruitIOFeedName(c.input)
		if out != c.output {
			t.Errorf("feed name not sanitized: input %q output %q expected %q", c.input, out, c.output)
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

type fakeMQTTToken struct {
	err error
}

func (t fakeMQTTToken) Wait() bool                     { return true }
func (t fakeMQTTToken) WaitTimeout(time.Duration) bool { return true }
func (t fakeMQTTToken) Done() <-chan struct{} {
	ch := make(chan struct{})
	close(ch)
	return ch
}
func (t fakeMQTTToken) Error() error { return t.err }

type fakeMQTTClient struct {
	topic    string
	qos      byte
	retained bool
	payload  interface{}
	err      error
}

func (c *fakeMQTTClient) IsConnected() bool      { return true }
func (c *fakeMQTTClient) IsConnectionOpen() bool { return true }
func (c *fakeMQTTClient) Connect() mqtt.Token    { return fakeMQTTToken{} }
func (c *fakeMQTTClient) Disconnect(uint)        {}
func (c *fakeMQTTClient) Subscribe(string, byte, mqtt.MessageHandler) mqtt.Token {
	return fakeMQTTToken{}
}
func (c *fakeMQTTClient) SubscribeMultiple(map[string]byte, mqtt.MessageHandler) mqtt.Token {
	return fakeMQTTToken{}
}
func (c *fakeMQTTClient) Unsubscribe(...string) mqtt.Token        { return fakeMQTTToken{} }
func (c *fakeMQTTClient) AddRoute(string, mqtt.MessageHandler)    {}
func (c *fakeMQTTClient) OptionsReader() mqtt.ClientOptionsReader { return mqtt.ClientOptionsReader{} }
func (c *fakeMQTTClient) Publish(topic string, qos byte, retained bool, payload interface{}) mqtt.Token {
	c.topic = topic
	c.qos = qos
	c.retained = retained
	c.payload = payload
	return fakeMQTTToken{err: c.err}
}

func TestEmitMQTTPublishesWithConfiguredPrefix(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	client := &fakeMQTTClient{}
	tele := TestTelemetry(store)
	tele.mClient = &MQTTClient{
		config: MQTTConfig{
			Prefix:   "reef",
			QoS:      1,
			Retained: true,
		},
		client: client,
	}

	if err := tele.EmitMQTT("system_load5", 2.5); err != nil {
		t.Fatal(err)
	}
	if client.topic != "reef/system_load5" {
		t.Fatalf("expected prefixed topic, got %q", client.topic)
	}
	if client.qos != 1 || !client.retained {
		t.Fatalf("unexpected publish options: qos=%d retained=%t", client.qos, client.retained)
	}
	if client.payload != "2.500000" {
		t.Fatalf("expected formatted payload, got %#v", client.payload)
	}
}

func TestEmitMetricMQTTErrorLogs(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	var logged bool
	tele := TestTelemetry(store)
	tele.config.MQTT.Enable = true
	tele.logError = func(subject, body string) error {
		logged = subject == "telemtry-mqtt" && strings.Contains(body, "publish failed")
		return nil
	}
	tele.mClient = &MQTTClient{
		client: &fakeMQTTClient{err: errors.New("publish failed")},
	}

	tele.EmitMetric("system", "load", 1.2)
	if !logged {
		t.Fatal("expected MQTT publish error to be logged")
	}
}

type aioRoundTripper struct {
	statusByMethod map[string]int
	requests       []*http.Request
}

func (rt *aioRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	rt.requests = append(rt.requests, req)
	status := rt.statusByMethod[req.Method]
	if status == 0 {
		status = http.StatusOK
	}
	body := `{}`
	if status >= 400 {
		body = `aio error`
	}
	return &http.Response{
		StatusCode: status,
		Header:     make(http.Header),
		Body:       io.NopCloser(strings.NewReader(body)),
		Request:    req,
	}, nil
}

func withAIORoundTripper(t *testing.T, rt http.RoundTripper) {
	t.Helper()
	oldTransport := http.DefaultTransport
	http.DefaultTransport = rt
	t.Cleanup(func() {
		http.DefaultTransport = oldTransport
	})
}

func TestEmitAIO(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	rt := &aioRoundTripper{statusByMethod: map[string]int{http.MethodPost: http.StatusCreated}}
	withAIORoundTripper(t, rt)
	tele := TestTelemetry(store)
	tele.aClient = adafruitio.NewClient("token")

	if err := tele.EmitAIO("reef", "system-load5", 12.3); err != nil {
		t.Fatal(err)
	}
	if len(rt.requests) != 1 || rt.requests[0].URL.Path != "/api/v2/reef/feeds/system-load5/data" {
		t.Fatalf("unexpected AIO request path: %#v", rt.requests)
	}
}

func TestCreateAndDeleteFeedFailurePaths(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	rt := &aioRoundTripper{statusByMethod: map[string]int{
		http.MethodGet:    http.StatusNotFound,
		http.MethodPost:   http.StatusInternalServerError,
		http.MethodDelete: http.StatusInternalServerError,
	}}
	withAIORoundTripper(t, rt)

	tele := TestTelemetry(store)
	tele.config.AdafruitIO = AdafruitIO{Enable: true, User: "reef", Token: "token", Prefix: "tank-"}
	tele.aClient = adafruitio.NewClient("token")

	tele.CreateFeedIfNotExist("System Load")
	tele.DeleteFeedIfExist("System Load")

	if len(rt.requests) != 3 {
		t.Fatalf("expected get, create, and delete requests, got %d", len(rt.requests))
	}
	if rt.requests[0].Method != http.MethodGet || rt.requests[1].Method != http.MethodPost || rt.requests[2].Method != http.MethodDelete {
		t.Fatalf("unexpected request methods: %s %s %s", rt.requests[0].Method, rt.requests[1].Method, rt.requests[2].Method)
	}
}
