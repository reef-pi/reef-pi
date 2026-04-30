package system

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreRepositoryUptime(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	start := TimeLog{Time: "2026-04-29T10:00:00Z"}
	if err := repo.LogStartTime(start); err != nil {
		t.Fatal(err)
	}
	gotStart, err := repo.LastStartTime()
	if err != nil {
		t.Fatal(err)
	}
	if gotStart.Time != start.Time {
		t.Fatalf("expected start time %q, got %q", start.Time, gotStart.Time)
	}

	stop := TimeLog{Time: "2026-04-29T11:00:00Z"}
	if err := repo.LogStopTime(stop); err != nil {
		t.Fatal(err)
	}
	gotStop, err := repo.LastStopTime()
	if err != nil {
		t.Fatal(err)
	}
	if gotStop.Time != stop.Time {
		t.Fatalf("expected stop time %q, got %q", stop.Time, gotStop.Time)
	}
}

func TestStoreRepositoryUptimeOverwritesExistingValues(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	if err := repo.LogStartTime(TimeLog{Time: "2026-04-29T10:00:00Z"}); err != nil {
		t.Fatal(err)
	}
	if err := repo.LogStartTime(TimeLog{Time: "2026-04-29T10:05:00Z"}); err != nil {
		t.Fatal(err)
	}

	got, err := repo.LastStartTime()
	if err != nil {
		t.Fatal(err)
	}
	if got.Time != "2026-04-29T10:05:00Z" {
		t.Fatalf("expected overwritten start time, got %q", got.Time)
	}
}
