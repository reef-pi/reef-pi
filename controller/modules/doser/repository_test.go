package doser

import (
	"testing"

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

	pump := Pump{
		Name: "Alkalinity",
		Jack: "jack-1",
		Pin:  1,
		Regiment: DosingRegiment{
			Schedule: Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
			Duration: 5,
			Speed:    60,
		},
	}
	created, err := repo.Create(pump)
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
	if got.ID != "1" || got.Name != "Alkalinity" || got.Jack != "jack-1" {
		t.Fatalf("unexpected pump: %#v", got)
	}

	got.ID = "stale"
	got.Name = "Calcium"
	if err := repo.Update(created.ID, got); err != nil {
		t.Fatal(err)
	}

	pumps, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(pumps) != 1 || pumps[0].ID != "1" || pumps[0].Name != "Calcium" {
		t.Fatalf("unexpected pumps: %#v", pumps)
	}

	if err := repo.Delete(created.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(created.ID); err == nil {
		t.Fatal("expected deleted pump lookup to fail")
	}
}
