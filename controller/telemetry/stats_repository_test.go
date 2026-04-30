package telemetry

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreStatsRepositoryLoadSaveDelete(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	if err := store.CreateBucket("stats-repository-test"); err != nil {
		t.Fatal(err)
	}

	repo := newStatsRepository(store, "stats-repository-test")
	expected := StatsResponse{
		Current: []Metric{
			testMetric{V: 1.2},
		},
		Historical: []Metric{
			testMetric{V: 3.4},
		},
	}
	if err := repo.Save("sensor", expected); err != nil {
		t.Fatal(err)
	}

	var got StatsOnDisk
	if err := repo.Load("sensor", &got); err != nil {
		t.Fatal(err)
	}
	if len(got.Current) != 1 || len(got.Historical) != 1 {
		t.Fatalf("expected one current and historical metric, got %#v", got)
	}

	if err := repo.Delete("sensor"); err != nil {
		t.Fatal(err)
	}
	if err := repo.Load("sensor", &got); err == nil {
		t.Fatal("expected deleted stats lookup to fail")
	}
}
