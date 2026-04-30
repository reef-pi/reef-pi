package connectors

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreOutletRepositoryCRUD(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newOutletRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	outlet := Outlet{
		Name:      "Return Pump",
		Pin:       21,
		Equipment: "1",
		Reverse:   true,
		Driver:    "rpi",
	}
	if err := repo.Create(outlet); err != nil {
		t.Fatal(err)
	}

	got, err := repo.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "1" || got.Name != "Return Pump" || got.Pin != 21 || got.Equipment != "1" || !got.Reverse || got.Driver != "rpi" {
		t.Fatalf("unexpected outlet: %#v", got)
	}

	got.Name = "Skimmer"
	got.Equipment = ""
	got.Reverse = false
	if err := repo.Update(got.ID, got); err != nil {
		t.Fatal(err)
	}

	outlets, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(outlets) != 1 || outlets[0].ID != "1" || outlets[0].Name != "Skimmer" || outlets[0].Equipment != "" || outlets[0].Reverse {
		t.Fatalf("unexpected outlet list: %#v", outlets)
	}

	if err := repo.Delete(got.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(got.ID); err == nil {
		t.Fatal("expected deleted outlet lookup to fail")
	}
}
