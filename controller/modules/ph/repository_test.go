package ph

import (
	"testing"
	"time"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreRepositoryCRUD(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	probe := Probe{
		Name:        "Main pH",
		Period:      5 * time.Second,
		AnalogInput: "analog-1",
		Enable:      true,
	}
	created, err := repo.Create(probe)
	if err != nil {
		t.Fatal(err)
	}
	if created.ID != "1" {
		t.Fatalf("expected created ID 1, got %q", created.ID)
	}

	got, err := repo.Get(created.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Name != "Main pH" || got.AnalogInput != "analog-1" {
		t.Fatalf("unexpected probe: %#v", got)
	}

	got.Name = "Sump pH"
	if err := repo.Update(got.ID, got); err != nil {
		t.Fatal(err)
	}

	probes, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(probes) != 1 || probes[0].Name != "Sump pH" {
		t.Fatalf("unexpected probes: %#v", probes)
	}

	if err := repo.Delete(got.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(got.ID); err == nil {
		t.Fatal("expected deleted probe lookup to fail")
	}
}

func TestStoreRepositoryCalibrationPersistence(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	probe, err := repo.Create(Probe{Name: "Calibrated pH", Period: time.Second})
	if err != nil {
		t.Fatal(err)
	}
	measurements := []hal.Measurement{
		{Observed: 7.8, Expected: 8.0},
		{Observed: 9.8, Expected: 10.0},
	}
	if err := repo.SaveCalibration(probe.ID, measurements); err != nil {
		t.Fatal(err)
	}

	got, err := repo.GetCalibration(probe.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 || got[0].Observed != 7.8 || got[1].Expected != 10.0 {
		t.Fatalf("unexpected calibration: %#v", got)
	}

	calibrations, err := repo.ListCalibrations()
	if err != nil {
		t.Fatal(err)
	}
	if len(calibrations) != 1 || len(calibrations[probe.ID]) != 2 {
		t.Fatalf("unexpected calibrations: %#v", calibrations)
	}

	if err := repo.Delete(probe.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.GetCalibration(probe.ID); err == nil {
		t.Fatal("expected deleted calibration lookup to fail")
	}
}
