package telemetry

import (
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type testMetric struct {
	Value int
}

func (m1 *testMetric) Before(m Metric) bool {
	return true
}

func (m1 *testMetric) Rollup(m Metric) (Metric, bool) {
	return m1, true
}

func TestStatsManager(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Error(err)
	}
	defer store.Close()

	store.CreateBucket("test-subsystem")
	mgr := TestTelemetry(store).NewStatsManager("test-subsystem")
	metric := &testMetric{}
	mgr.Update("foo", metric)
	mgr.Update("foo", metric)
	if err := mgr.Save("foo"); err != nil {
		t.Error(err)
	}
	fn := func(_ json.RawMessage) interface{} { return metric }
	if err := mgr.Load("foo", fn); err != nil {
		t.Error(err)
	}
	if err := mgr.Delete("foo"); err != nil {
		t.Error(err)
	}
}

func TestInitialize(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Error(err)
	}
	defer store.Close()

	logger := func(_, _ string) error { return nil }
	Initialize("telemetry", store, logger, true)
}
