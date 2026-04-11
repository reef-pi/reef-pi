package telemetry

import (
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

// testMetric is a minimal Metric for testing StatsManager
type testMetric struct {
	V float64
	T TeleTime
}

func (m testMetric) Rollup(other Metric) (Metric, bool) {
	return other, true
}

func (m testMetric) Before(other Metric) bool {
	return m.T.Before(other.(testMetric).T)
}

func newTestMgr(store storage.Store) StatsManager {
	store.CreateBucket("stats-test")
	return &mgr{
		inMemory:        make(map[string]Stats),
		bucket:          "stats-test",
		store:           store,
		CurrentLimit:    10,
		HistoricalLimit: 10,
	}
}

func TestStatsManagerInitialize(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	m := newTestMgr(store)
	if err := m.Initialize("sensor-1"); err != nil {
		t.Error("Initialize failed:", err)
	}
	if !m.IsLoaded("sensor-1") {
		t.Error("Expected sensor-1 to be loaded after Initialize")
	}
}

func TestStatsManagerIsLoaded(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	m := newTestMgr(store)
	if m.IsLoaded("nonexistent") {
		t.Error("Expected IsLoaded to return false for unknown id")
	}
	m.Initialize("existing")
	if !m.IsLoaded("existing") {
		t.Error("Expected IsLoaded to return true after Initialize")
	}
}

func TestStatsManagerDelete(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	m := newTestMgr(store)
	m.Initialize("sensor-del")
	if !m.IsLoaded("sensor-del") {
		t.Fatal("Expected sensor-del to be loaded")
	}
	if err := m.Delete("sensor-del"); err != nil {
		t.Error("Delete failed:", err)
	}
	if m.IsLoaded("sensor-del") {
		t.Error("Expected sensor-del to be gone after Delete")
	}
}

func TestStatsManagerUpdateAndGet(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	m := newTestMgr(store)
	m.Initialize("sensor-2")
	metric := testMetric{V: 7.2}
	m.Update("sensor-2", metric)

	resp, err := m.Get("sensor-2")
	if err != nil {
		t.Error("Get failed:", err)
	}
	if len(resp.Current) == 0 {
		t.Error("Expected at least one current reading")
	}
}

func TestStatsManagerLoad(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	m := newTestMgr(store)
	// Load with no data in store should return an error (key not found)
	err = m.Load("missing", func(raw json.RawMessage) interface{} {
		return nil
	})
	if err == nil {
		t.Error("Expected error loading non-existent stats, got nil")
	}
}
