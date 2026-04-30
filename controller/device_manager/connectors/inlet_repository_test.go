package connectors

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreInletRepositoryCRUD(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newInletRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	inlet := Inlet{
		Name:      "ATO Sensor",
		Pin:       16,
		Equipment: "1",
		Reverse:   true,
		Driver:    "rpi",
	}
	if err := repo.Create(inlet); err != nil {
		t.Fatal(err)
	}

	got, err := repo.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "1" || got.Name != "ATO Sensor" || got.Pin != 16 || got.Equipment != "1" || !got.Reverse || got.Driver != "rpi" {
		t.Fatalf("unexpected inlet: %#v", got)
	}

	got.Name = "Leak Sensor"
	got.Equipment = ""
	got.Reverse = false
	if err := repo.Update(got.ID, got); err != nil {
		t.Fatal(err)
	}

	inlets, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(inlets) != 1 || inlets[0].ID != "1" || inlets[0].Name != "Leak Sensor" || inlets[0].Equipment != "" || inlets[0].Reverse {
		t.Fatalf("unexpected inlet list: %#v", inlets)
	}

	if err := repo.Delete(got.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(got.ID); err == nil {
		t.Fatal("expected deleted inlet lookup to fail")
	}
}
