package doser

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type fakeDoserStatsManager struct {
	updates []telemetry.Metric
	saves   []string
}

func (f *fakeDoserStatsManager) Get(string) (telemetry.StatsResponse, error) {
	return telemetry.StatsResponse{}, nil
}

func (f *fakeDoserStatsManager) IsLoaded(string) bool { return false }

func (f *fakeDoserStatsManager) Initialize(string) error { return nil }

func (f *fakeDoserStatsManager) Load(string, func(json.RawMessage) interface{}) error { return nil }

func (f *fakeDoserStatsManager) Save(id string) error {
	f.saves = append(f.saves, id)
	return nil
}

func (f *fakeDoserStatsManager) Update(_ string, m telemetry.Metric) {
	f.updates = append(f.updates, m)
}

func (f *fakeDoserStatsManager) Delete(string) error { return nil }

type fakeDoserTelemetry struct {
	metrics []struct {
		module string
		name   string
		value  float64
	}
}

func (f *fakeDoserTelemetry) Alert(string, string) (bool, error) { return false, nil }

func (f *fakeDoserTelemetry) Mail(string, string) (bool, error) { return false, nil }

func (f *fakeDoserTelemetry) EmitMetric(module, name string, value float64) {
	f.metrics = append(f.metrics, struct {
		module string
		name   string
		value  float64
	}{module: module, name: name, value: value})
}

func (f *fakeDoserTelemetry) CreateFeedIfNotExist(string) {}

func (f *fakeDoserTelemetry) DeleteFeedIfExist(string) {}

func (f *fakeDoserTelemetry) NewStatsManager(string) telemetry.StatsManager { return nil }

func (f *fakeDoserTelemetry) SendTestMessage(http.ResponseWriter, *http.Request) {}

func (f *fakeDoserTelemetry) GetConfig(http.ResponseWriter, *http.Request) {}

func (f *fakeDoserTelemetry) UpdateConfig(http.ResponseWriter, *http.Request) {}

func (f *fakeDoserTelemetry) LogError(string, string) error { return nil }

func TestPumpIsValidRejectsNegativeSoftStart(t *testing.T) {
	t.Parallel()

	p := Pump{
		Name: "dc-pump",
		Jack: "1",
		Pin:  0,
		Regiment: DosingRegiment{
			SoftStart: -1,
			Schedule:  Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
		},
	}

	if err := p.IsValid(); err == nil {
		t.Fatal("expected negative soft start to fail validation")
	}
}

func TestRunnerPWMDoseWithoutSoftStart(t *testing.T) {
	r := &Runner{
		pump: &Pump{
			Jack: "jack-1",
			Pin:  3,
			Regiment: DosingRegiment{
				SoftStart: 0,
			},
		},
		sleep: func(time.Duration) {},
	}

	var got []float64
	r.control = func(_ string, values map[int]float64) error {
		got = append(got, values[r.pump.Pin])
		return nil
	}

	if err := r.PWMDose(80, 10); err != nil {
		t.Fatalf("PWMDose failed: %v", err)
	}

	want := []float64{80, 0}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected PWM sequence: got %v want %v", got, want)
	}
}

func TestRunnerPWMDoseWithSoftStart(t *testing.T) {
	r := &Runner{
		pump: &Pump{
			Jack: "jack-1",
			Pin:  3,
			Regiment: DosingRegiment{
				SoftStart: 2,
			},
		},
		sleep: func(time.Duration) {},
	}

	var got []float64
	r.control = func(_ string, values map[int]float64) error {
		got = append(got, values[r.pump.Pin])
		return nil
	}

	if err := r.PWMDose(80, 10); err != nil {
		t.Fatalf("PWMDose failed: %v", err)
	}

	want := []float64{
		8, 16, 24, 32, 40, 48, 56, 64, 72, 80,
		72, 64, 56, 48, 40, 32, 24, 16, 8, 0,
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected PWM ramp sequence: got %v want %v", got, want)
	}
}

func TestRunnerRunUsesCalibratedVolumeForPWMDuration(t *testing.T) {
	stats := &fakeDoserStatsManager{}
	tel := &fakeDoserTelemetry{}
	r := &Runner{
		pump: &Pump{
			ID:   "pump-1",
			Name: "alk",
			Jack: "jack-1",
			Pin:  3,
			Regiment: DosingRegiment{
				Speed:           60,
				Duration:        99,
				Volume:          6,
				VolumePerSecond: 2,
			},
		},
		statsMgr: stats,
		t:        tel,
		sleep:    func(time.Duration) {},
	}

	var got []float64
	r.control = func(_ string, values map[int]float64) error {
		got = append(got, values[r.pump.Pin])
		return nil
	}

	r.Run()

	if want := []float64{60, 0}; !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected PWM sequence: got %v want %v", got, want)
	}
	if len(stats.updates) != 1 {
		t.Fatalf("expected one stats update, got %d", len(stats.updates))
	}
	if got := stats.updates[0].(Usage).Pump; got != 3 {
		t.Fatalf("expected calibrated usage duration 3, got %d", got)
	}
	if !reflect.DeepEqual(stats.saves, []string{"pump-1"}) {
		t.Fatalf("unexpected stats saves: %v", stats.saves)
	}
	if len(tel.metrics) != 1 {
		t.Fatalf("expected one emitted metric, got %d", len(tel.metrics))
	}
	if metric := tel.metrics[0]; metric.module != "doser" || metric.name != "alk-usage" || metric.value != 3 {
		t.Fatalf("unexpected emitted metric: %+v", metric)
	}
}

func TestRunnerRunSkipsStatsWhenPWMControlFails(t *testing.T) {
	stats := &fakeDoserStatsManager{}
	tel := &fakeDoserTelemetry{}
	r := &Runner{
		pump: &Pump{
			ID:   "pump-1",
			Name: "alk",
			Jack: "jack-1",
			Pin:  3,
			Regiment: DosingRegiment{
				Speed:    60,
				Duration: 3,
			},
		},
		statsMgr: stats,
		t:        tel,
		sleep:    func(time.Duration) {},
		control: func(string, map[int]float64) error {
			return fmt.Errorf("boom")
		},
	}

	r.Run()

	if len(stats.updates) != 0 {
		t.Fatalf("expected no stats updates, got %d", len(stats.updates))
	}
	if len(stats.saves) != 0 {
		t.Fatalf("expected no stats saves, got %d", len(stats.saves))
	}
	if len(tel.metrics) != 0 {
		t.Fatalf("expected no metrics, got %d", len(tel.metrics))
	}
}
