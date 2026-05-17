package system

import (
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

type fakeUptimeRepo struct {
	start TimeLog
	err   error
}

func (r fakeUptimeRepo) Setup() error                    { return nil }
func (r fakeUptimeRepo) LogStartTime(TimeLog) error      { return nil }
func (r fakeUptimeRepo) LogStopTime(TimeLog) error       { return nil }
func (r fakeUptimeRepo) LastStartTime() (TimeLog, error) { return r.start, r.err }
func (r fakeUptimeRepo) LastStopTime() (TimeLog, error)  { return TimeLog{}, nil }

func TestUptimeReturnsUnknownForMissingOrInvalidStartTime(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		repo repository
	}{
		{
			name: "missing start time",
			repo: fakeUptimeRepo{err: errors.New("missing start time")},
		},
		{
			name: "invalid start time",
			repo: fakeUptimeRepo{start: TimeLog{Time: "not-rfc3339"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &Controller{repo: tt.repo}
			if got := c.Uptime(); got != "unknown" {
				t.Fatalf("expected unknown uptime, got %q", got)
			}
		})
	}
}

func TestComputeSummaryIncludesRaspberryPiTemperature(t *testing.T) {
	t.Parallel()

	c := &Controller{
		config: Config{
			DevMode: true,
			Name:    "reef-pi",
			Version: "1.2.3",
		},
		ip:            "127.0.0.1",
		model:         "test pi",
		isRaspberryPi: true,
		repo:          fakeUptimeRepo{start: TimeLog{Time: time.Now().Add(-time.Hour).Format(time.RFC3339)}},
	}

	summary := c.ComputeSummary()
	if summary.Name != "reef-pi" || summary.IP != "127.0.0.1" || summary.Version != "1.2.3" || summary.Model != "test pi" {
		t.Fatalf("unexpected summary fields: %+v", summary)
	}
	if summary.CPUTemperature != "23.23 " {
		t.Fatalf("expected dev-mode cpu temperature, got %q", summary.CPUTemperature)
	}
	if summary.Uptime == "" || summary.Uptime == "unknown" {
		t.Fatalf("expected computed uptime, got %q", summary.Uptime)
	}
}

func TestHostIPReturnsLoopbackIPv4(t *testing.T) {
	t.Parallel()

	if _, err := net.InterfaceByName("lo"); err != nil {
		t.Skip("loopback interface lo is not available")
	}

	ip := HostIP("lo")
	if ip == unknownIface {
		t.Fatal("expected loopback interface to have an IPv4 address")
	}
	if parsed := net.ParseIP(ip); parsed == nil || parsed.To4() == nil {
		t.Fatalf("expected IPv4 loopback address, got %q", ip)
	}
}

func TestGetDisplayStateReturnsCurrentStateWhenDisplayEnabled(t *testing.T) {
	t.Parallel()

	c := &Controller{
		config: Config{
			DevMode: true,
			Display: true,
		},
	}

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/display", strings.NewReader("{}"))
	c.GetDisplayState(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var state DisplayState
	if err := json.Unmarshal(rr.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if state.On || state.Brightness != 0 {
		t.Fatalf("expected dev-mode display state, got %+v", state)
	}
}

func TestUpgradeRejectsInvalidJSONWithoutRunningUpgrade(t *testing.T) {
	t.Parallel()

	c := &Controller{}
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/admin/upgrade", strings.NewReader("{"))

	c.upgrade(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rr.Code, rr.Body.String())
	}
}
