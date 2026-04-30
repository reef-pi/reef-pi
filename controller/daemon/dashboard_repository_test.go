package daemon

import (
	"reflect"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestDashboardRepositorySetupPersistsDefaultDashboard(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newDashboardRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	var stored Dashboard
	if err := store.Get(Bucket, dashboardKey, &stored); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(DefaultDashboard, stored) {
		t.Fatalf("expected default dashboard, got %#v", stored)
	}
}

func TestDashboardRepositoryGet(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	if err := store.CreateBucket(Bucket); err != nil {
		t.Fatal(err)
	}
	expected := Dashboard{
		Column: 2,
		Row:    3,
		Width:  640,
		Height: 480,
		GridDetails: [][]Chart{{{
			Type: "temperature",
			ID:   "temp-1",
		}}},
	}
	if err := store.Update(Bucket, dashboardKey, expected); err != nil {
		t.Fatal(err)
	}

	actual, err := newDashboardRepository(store).Get()
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(expected, actual) {
		t.Fatalf("expected %#v, got %#v", expected, actual)
	}
}

func TestDashboardRepositoryUpdate(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	if err := store.CreateBucket(Bucket); err != nil {
		t.Fatal(err)
	}
	expected := Dashboard{
		Column: 4,
		Row:    5,
		Width:  800,
		Height: 600,
		GridDetails: [][]Chart{{{
			Type: "health",
		}, {
			Type: "ato",
			ID:   "ato-1",
		}}},
	}

	if err := newDashboardRepository(store).Update(expected); err != nil {
		t.Fatal(err)
	}

	var stored Dashboard
	if err := store.Get(Bucket, dashboardKey, &stored); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(expected, stored) {
		t.Fatalf("expected %#v, got %#v", expected, stored)
	}
}
