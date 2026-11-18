package daemon

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	phModule "github.com/reef-pi/reef-pi/controller/modules/ph"
	temperatureModule "github.com/reef-pi/reef-pi/controller/modules/temperature"
	"github.com/reef-pi/reef-pi/controller/telemetry"
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

func observationAt(v float64, at time.Time) controller.Observation {
	return controller.Observation{Value: v, Time: telemetry.TeleTime(at)}
}

func TestObservationPointsMergesFiltersAndSorts(t *testing.T) {
	now := time.Now()
	stats := telemetry.StatsResponse{
		Historical: []telemetry.Metric{
			observationAt(70, now.Add(-30*time.Hour)), // outside a 1d window
			observationAt(75, now.Add(-5*time.Hour)),
		},
		Current: []telemetry.Metric{
			observationAt(78, now.Add(-2*time.Minute)),
			observationAt(77, now.Add(-10*time.Minute)),
		},
	}

	points := observationPoints(stats, now.Add(-24*time.Hour))
	if len(points) != 3 {
		t.Fatalf("expected 3 points inside the window, got %#v", points)
	}
	if points[0].V != 75 || points[1].V != 77 || points[2].V != 78 {
		t.Fatalf("points should be oldest first: %#v", points)
	}
	if points[0].T != now.Add(-5*time.Hour).UnixMilli() {
		t.Fatalf("t should be Unix milliseconds: %d", points[0].T)
	}
	if got := observationPoints(stats, now.Add(-time.Hour)); len(got) != 2 {
		t.Fatalf("1h window should keep only the recent readings, got %#v", got)
	}
	if got := observationPoints(telemetry.StatsResponse{}, now.Add(-time.Hour)); got == nil || len(got) != 0 {
		t.Fatalf("expected an empty, non-nil series, got %#v", got)
	}
}

func TestLowestIDPrefersTheNumericallySmallest(t *testing.T) {
	if _, ok := lowestID(nil); ok {
		t.Fatal("no ids should report not found")
	}
	if id, _ := lowestID([]string{"10", "9", "2"}); id != "2" {
		t.Fatalf("expected 2, got %s", id)
	}
	if id, _ := lowestID([]string{"b", "a"}); id != "a" {
		t.Fatalf("non numeric ids fall back to string order, got %s", id)
	}
}

func TestTelemetrySeriesResolvesTheFirstTemperatureAndPhProbe(t *testing.T) {
	r := newHTTPCompositionTestReefPi(t)
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}

	tcs, err := temperatureModule.New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := tcs.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := tcs.Create(&temperatureModule.TC{Name: "Display", Period: 60, Sensor: "28-devmodeenable"}); err != nil {
		t.Fatal(err)
	}
	r.subsystems.Load(temperatureModule.Bucket, tcs)

	probes := phModule.New(true, con)
	if err := probes.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := probes.Create(phModule.Probe{Name: "Display pH", Period: 60}); err != nil {
		t.Fatal(err)
	}
	r.subsystems.Load(phModule.Bucket, probes)

	// A temperature controller and a pH probe exist but nothing has been recorded yet.
	handler := r.serverHandler()
	cookies := signInCookies(t, handler)
	for _, path := range []string{"/api/telemetry/temperature.display?range=6h", "/api/telemetry/ph.display?range=7d"} {
		response := get(handler, path, cookies)
		if response.Code != http.StatusOK || strings.TrimSpace(response.Body.String()) != "[]" {
			t.Fatalf("GET %s: expected 200 [], got %d %q", path, response.Code, response.Body.String())
		}
	}
}
