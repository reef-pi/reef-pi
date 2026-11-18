package daemon

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func signInCookies(t *testing.T, handler http.Handler) []*http.Cookie {
	t.Helper()
	signIn := httptest.NewRecorder()
	handler.ServeHTTP(signIn, httptest.NewRequest("POST", "/auth/signin", bytes.NewBufferString(`{"user":"reef-pi","password":"reef-pi"}`)))
	if signIn.Code != http.StatusOK {
		t.Fatalf("sign in failed: %d %s", signIn.Code, signIn.Body.String())
	}
	return signIn.Result().Cookies()
}

func get(handler http.Handler, path string, cookies []*http.Cookie) *httptest.ResponseRecorder {
	request := httptest.NewRequest("GET", path, nil)
	for _, cookie := range cookies {
		request.AddCookie(cookie)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	return response
}

func TestTelemetrySeriesAnswersWithAnEmptySeries(t *testing.T) {
	r := newHTTPCompositionTestReefPi(t)
	handler := r.serverHandler()
	cookies := signInCookies(t, handler)

	for _, path := range []string{
		"/api/telemetry/temperature.display?range=1d",
		"/api/telemetry/ph.display?range=1h",
		"/api/telemetry/ato.reservoir?range=30d",
		"/api/telemetry/temperature.display",
	} {
		response := get(handler, path, cookies)
		if response.Code != http.StatusOK {
			t.Fatalf("GET %s: expected 200, got %d: %s", path, response.Code, response.Body.String())
		}
		if body := strings.TrimSpace(response.Body.String()); body != "[]" {
			t.Fatalf("GET %s: expected an empty series, got %q", path, body)
		}
	}

	if response := get(handler, "/api/telemetry/ph.display?range=10y", cookies); response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for an unsupported range, got %d", response.Code)
	}
}

func TestTelemetrySeriesRequiresAuthentication(t *testing.T) {
	r := newHTTPCompositionTestReefPi(t)
	assertHTTPStatus(t, r.serverHandler(), "GET", "/api/telemetry/ph.display?range=1d", nil, http.StatusUnauthorized)
}
