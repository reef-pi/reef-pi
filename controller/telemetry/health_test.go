package telemetry

import (
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

type failingMailer struct{}

func (f failingMailer) Email(string, string) error {
	return errors.New("mail failed")
}

func TestHealthChecker(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Error(err)
	}
	defer store.Close()

	c := settings.HealthCheckNotify{
		Enable:    true,
		MaxMemory: 100,
		MaxCPU:    100,
	}
	h := NewHealthChecker("reef-pi", 1, c, TestTelemetry(store), store)
	h.Check()
	go h.Start()
	h.Stop()
}

func TestHealthCheckerGetStats(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	c := settings.HealthCheckNotify{Enable: false}
	h := NewHealthChecker("reef-pi", 1, c, TestTelemetry(store), store)
	h.Check() // populate stats

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/health", nil)
	h.GetStats(w, req)
	if w.Code != 200 {
		t.Errorf("GetStats returned status %d, want 200", w.Code)
	}
}

func TestNotifyIfNeeded(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	c := settings.HealthCheckNotify{
		Enable:    true,
		MaxMemory: 50,
		MaxCPU:    50,
	}
	checker := NewHealthChecker("reef-pi", 1, c, TestTelemetry(store), store).(*hc)

	// Both memory and load above threshold — should trigger both notifications
	checker.NotifyIfNeeded(90, 90, 0)

	// Both below threshold — should be no-op
	checker.NotifyIfNeeded(10, 10, 0)

	// Notify disabled — should be no-op even if over threshold
	checker.Notify.Enable = false
	checker.NotifyIfNeeded(90, 90, 0)
}

func TestNotifyIfNeededCPUTemp(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	alerts := 0
	tele := TestTelemetry(store)
	tele.logError = func(_, _ string) error {
		alerts++
		return nil
	}
	checker := NewHealthChecker("reef-pi", time.Second, settings.HealthCheckNotify{
		Enable:     true,
		MaxMemory:  100,
		MaxCPU:     100,
		MaxCPUTemp: 70,
	}, tele, store).(*hc)

	checker.NotifyIfNeeded(10, 10, 71)
	if alerts != 1 {
		t.Fatalf("expected one CPU temperature alert, got %d", alerts)
	}
}

func TestSendReportSuccessAndFailure(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	tele := TestTelemetry(store)
	checker := &hc{
		t: tele,
		lastMetric: HealthMetric{
			Load5:        1.2,
			UsedMemory:   45.6,
			CPUTemp:      67.8,
			UnderVoltage: 1,
		},
	}
	checker.sendReport()

	tele.dispatcher = failingMailer{}
	checker.sendReport()
}

func TestHealthMetricRollupNewHourCarriesNewMetric(t *testing.T) {
	oldMetric := HealthMetric{
		Time:       TeleTime(time.Date(2026, 4, 28, 1, 0, 0, 0, time.UTC)),
		Load5:      1,
		UsedMemory: 10,
		len:        1,
		loadSum:    1,
		memorySum:  10,
	}
	newMetric := HealthMetric{
		Time:       TeleTime(time.Date(2026, 4, 28, 2, 0, 0, 0, time.UTC)),
		Load5:      2,
		UsedMemory: 20,
	}

	rolled, moved := oldMetric.Rollup(newMetric)
	if !moved {
		t.Fatal("expected rollup to move on a new hour")
	}
	if rolled.(HealthMetric).Load5 != 2 {
		t.Fatalf("expected new metric to be returned, got %#v", rolled)
	}
}
