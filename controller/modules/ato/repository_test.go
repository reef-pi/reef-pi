package ato

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
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

	ato := ATO{
		Name:    "Sump ATO",
		Inlet:   "inlet-1",
		Pump:    "pump-1",
		Period:  5,
		Control: true,
		Enable:  true,
	}
	created, err := repo.Create(ato)
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
	if got.ID != "1" || got.Name != "Sump ATO" || got.Inlet != "inlet-1" {
		t.Fatalf("unexpected ato: %#v", got)
	}

	got.ID = "stale"
	got.Name = "Reservoir ATO"
	if err := repo.Update(created.ID, got); err != nil {
		t.Fatal(err)
	}

	atos, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(atos) != 1 || atos[0].ID != "1" || atos[0].Name != "Reservoir ATO" {
		t.Fatalf("unexpected atos: %#v", atos)
	}

	if err := repo.Delete(created.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(created.ID); err == nil {
		t.Fatal("expected deleted ato lookup to fail")
	}
}

func TestStoreRepositoryDeleteUsage(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	created, err := repo.Create(ATO{Name: "Usage ATO", Period: 5})
	if err != nil {
		t.Fatal(err)
	}
	usage := Usage{Pump: 5, Time: telemetry.TeleTime(time.Now())}
	if err := store.Update(UsageBucket, created.ID, usage); err != nil {
		t.Fatal(err)
	}
	if err := repo.DeleteUsage(created.ID); err != nil {
		t.Fatal(err)
	}

	var got Usage
	if err := store.Get(UsageBucket, created.ID, &got); err == nil {
		t.Fatal("expected deleted usage lookup to fail")
	}
}

func TestStoreRepositoryDeleteRemovesUsage(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	created, err := repo.Create(ATO{Name: "Delete ATO", Period: 5})
	if err != nil {
		t.Fatal(err)
	}
	usage := Usage{Pump: 7, Time: telemetry.TeleTime(time.Now())}
	if err := store.Update(UsageBucket, created.ID, usage); err != nil {
		t.Fatal(err)
	}
	if err := repo.Delete(created.ID); err != nil {
		t.Fatal(err)
	}

	var got Usage
	if err := store.Get(UsageBucket, created.ID, &got); err == nil {
		t.Fatal("expected deleted usage lookup to fail")
	}
}
