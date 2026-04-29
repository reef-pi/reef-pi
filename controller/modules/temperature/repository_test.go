package temperature

import (
	"testing"
	"time"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func testRepository(t *testing.T) repository {
	t.Helper()
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		store.Close()
	})
	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}
	return repo
}

func TestRepositoryCRUD(t *testing.T) {
	repo := testRepository(t)

	tc := &TC{
		Name:   "Water",
		Period: 5 * time.Second,
		Sensor: "28-0001",
		Min:    77,
		Max:    81,
	}
	if err := repo.Create(tc); err != nil {
		t.Fatal(err)
	}
	if tc.ID != "1" {
		t.Fatalf("expected created id 1, got %s", tc.ID)
	}

	tcs, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(tcs) != 1 {
		t.Fatalf("expected 1 temperature controller, got %d", len(tcs))
	}
	if tcs[0].Name != "Water" || tcs[0].Sensor != "28-0001" {
		t.Fatalf("unexpected temperature controller: %+v", tcs[0])
	}

	tc.Name = "Sump"
	if err := repo.Update(tc.ID, tc); err != nil {
		t.Fatal(err)
	}
	tcs, err = repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if tcs[0].Name != "Sump" {
		t.Fatalf("expected updated name Sump, got %s", tcs[0].Name)
	}

	if err := repo.Delete(tc.ID); err != nil {
		t.Fatal(err)
	}
	tcs, err = repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(tcs) != 0 {
		t.Fatalf("expected no temperature controllers, got %d", len(tcs))
	}
}

func TestRepositoryCalibrationPersistence(t *testing.T) {
	repo := testRepository(t)

	ms := []hal.Measurement{
		{Observed: 77.1, Expected: 78.2},
		{Observed: 80.1, Expected: 81.2},
	}
	if err := repo.UpdateCalibration("28-0001", ms); err != nil {
		t.Fatal(err)
	}

	calibrations, err := repo.ListCalibrations()
	if err != nil {
		t.Fatal(err)
	}
	got, ok := calibrations["28-0001"]
	if !ok {
		t.Fatal("expected persisted calibration for sensor")
	}
	if len(got) != len(ms) {
		t.Fatalf("expected %d measurements, got %d", len(ms), len(got))
	}
	if got[0].Observed != 77.1 || got[0].Expected != 78.2 {
		t.Fatalf("unexpected first measurement: %+v", got[0])
	}

	if err := repo.DeleteCalibration("28-0001"); err != nil {
		t.Fatal(err)
	}
	calibrations, err = repo.ListCalibrations()
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := calibrations["28-0001"]; ok {
		t.Fatal("expected calibration to be deleted")
	}
}
