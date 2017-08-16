package utils

import (
	"encoding/json"
	"net/http"
	"strings"
	"testing"
)

func TestHelpers(t *testing.T) {
	tr := NewTestRouter()
	foo := make(map[string]string)
	tr.Router.HandleFunc("/foo", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(&foo)
	}).Methods("GET")
	if err := tr.Do("GET", "/foo", strings.NewReader("{}"), &foo); err != nil {
		t.Fatal("Failed to make http request using the test router. Error:", err)
	}
	if tele := TestTelemetry(); tele == nil {
		t.Fatal("Test telemetry returns nil")
	}
}
