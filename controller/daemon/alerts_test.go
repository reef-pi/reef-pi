package daemon

import (
	"bufio"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// readSSEEvent returns the event name and data of the next non-comment SSE event.
func readSSEEvent(t *testing.T, reader *bufio.Reader) (string, string) {
	t.Helper()
	var event, data string
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			t.Fatalf("stream ended before an event arrived: %v", err)
		}
		line = strings.TrimRight(line, "\r\n")
		switch {
		case line == "":
			if event != "" {
				return event, data
			}
		case strings.HasPrefix(line, ":"):
		case strings.HasPrefix(line, "event: "):
			event = strings.TrimPrefix(line, "event: ")
		case strings.HasPrefix(line, "data: "):
			data = strings.TrimPrefix(line, "data: ")
		}
	}
}

func TestStreamAlertsPushesNewErrorsOnly(t *testing.T) {
	previous := alertPollInterval
	alertPollInterval = 10 * time.Millisecond
	t.Cleanup(func() { alertPollInterval = previous })

	r := newHTTPCompositionTestReefPi(t)
	if err := r.setUpErrorBucket(); err != nil {
		t.Fatal(err)
	}
	if err := r.LogError("old-1", "logged before the client connected"); err != nil {
		t.Fatal(err)
	}

	server := httptest.NewServer(http.HandlerFunc(r.streamAlerts))
	t.Cleanup(server.Close)
	response, err := http.Get(server.URL)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { response.Body.Close() })
	if got := response.Header.Get("Content-Type"); got != "text/event-stream" {
		t.Fatalf("expected an event stream, got content type %q", got)
	}
	reader := bufio.NewReader(response.Body)

	if err := r.LogError("ato-1", "pump failed"); err != nil {
		t.Fatal(err)
	}
	event, data := readSSEEvent(t, reader)
	if event != "alert" {
		t.Fatalf("expected an alert event, got %q", event)
	}
	var alert alertEvent
	if err := json.Unmarshal([]byte(data), &alert); err != nil {
		t.Fatal(err)
	}
	if alert.ID != "ato-1-1" || alert.Severity != "critical" || alert.Title != "pump failed" || alert.Detail != "ato-1" || alert.TS == 0 {
		t.Fatalf("unexpected alert: %#v", alert)
	}

	// The same error recurring is a new alert; the pre-existing one was never replayed.
	if err := r.LogError("ato-1", "pump failed again"); err != nil {
		t.Fatal(err)
	}
	_, data = readSSEEvent(t, reader)
	if err := json.Unmarshal([]byte(data), &alert); err != nil {
		t.Fatal(err)
	}
	if alert.ID != "ato-1-2" || alert.Title != "pump failed again" {
		t.Fatalf("unexpected repeat alert: %#v", alert)
	}
}

func TestAlertsRouteRequiresAuthentication(t *testing.T) {
	r := newHTTPCompositionTestReefPi(t)
	handler := r.serverHandler()
	assertHTTPStatus(t, handler, "GET", "/api/alerts", nil, http.StatusUnauthorized)
}
