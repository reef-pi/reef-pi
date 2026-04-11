package telemetry

import (
	"encoding/json"
	"testing"
	"time"

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

func TestStatsManagerLoadSuccess(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	m := newTestMgr(store)
	// Write some metrics first so Load can read them back
	m.Initialize("sensor-load")
	m.Update("sensor-load", testMetric{V: 1.0})
	m.Update("sensor-load", testMetric{V: 2.0})
	if err := m.Save("sensor-load"); err != nil {
		t.Fatal("Save failed:", err)
	}

	// Load them back into a fresh manager
	m2 := newTestMgr(store)
	fn := func(raw json.RawMessage) interface{} {
		var tm testMetric
		json.Unmarshal(raw, &tm)
		return tm
	}
	if err := m2.Load("sensor-load", fn); err != nil {
		t.Error("Load failed:", err)
	}
	if !m2.IsLoaded("sensor-load") {
		t.Error("Expected sensor-load to be loaded after Load")
	}
}

func TestStatsManagerUpdateRollupSameHour(t *testing.T) {
	// Use a metric whose Rollup always returns moved=false (same hour)
	type sameHourMetric struct {
		V float64
		T TeleTime
	}
	type shmWrapper struct {
		sameHourMetric
	}
	// Use the existing testMetric which returns moved=true — test the
	// opposite by pre-populating with a metric that rolls up in-place
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	// inPlaceMetric always rolls up without moving (moved=false)
	type inPlaceMetric struct {
		V float64
		T TeleTime
	}
	_ = inPlaceMetric{}

	m := newTestMgr(store)
	m.Initialize("sensor-rollup")

	// Push enough metrics to trigger the Rollup path via testMetric (moved=true path already exercised)
	// Now test with a custom metric type that rolls up in-place (same hour — moved=false)
	// We simulate this by using HealthMetric same-hour rollup
	now := TeleTime(time.Now())
	hm1 := HealthMetric{Load5: 1.0, UsedMemory: 10.0, len: 1, loadSum: 1.0, memorySum: 10.0, Time: now}
	hm2 := HealthMetric{Load5: 2.0, UsedMemory: 20.0, len: 1, loadSum: 2.0, memorySum: 20.0, Time: now}

	store.CreateBucket("health-rollup-test")
	hMgr := &mgr{
		inMemory:        make(map[string]Stats),
		bucket:          "health-rollup-test",
		store:           store,
		CurrentLimit:    10,
		HistoricalLimit: 10,
	}
	hMgr.Initialize("hm")
	hMgr.Update("hm", hm1)
	// Second update with same hour — Rollup returns moved=false
	hMgr.Update("hm", hm2)

	resp, err := hMgr.Get("hm")
	if err != nil {
		t.Error("Get failed:", err)
	}
	if len(resp.Current) == 0 {
		t.Error("Expected at least one current reading after rollup")
	}
}
