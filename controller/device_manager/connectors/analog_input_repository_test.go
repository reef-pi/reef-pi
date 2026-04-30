package connectors

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreAnalogInputRepositoryCRUD(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newAnalogInputRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	input := AnalogInput{
		Name:   "pH Probe",
		Pin:    0,
		Driver: "1",
	}
	if err := repo.Create(input); err != nil {
		t.Fatal(err)
	}

	got, err := repo.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "1" || got.Name != "pH Probe" || got.Pin != 0 || got.Driver != "1" {
		t.Fatalf("unexpected analog input: %#v", got)
	}

	got.Name = "ORP Probe"
	got.Pin = 1
	if err := repo.Update(got.ID, got); err != nil {
		t.Fatal(err)
	}

	inputs, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(inputs) != 1 || inputs[0].ID != "1" || inputs[0].Name != "ORP Probe" || inputs[0].Pin != 1 || inputs[0].Driver != "1" {
		t.Fatalf("unexpected analog input list: %#v", inputs)
	}

	if err := repo.Delete(got.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(got.ID); err == nil {
		t.Fatal("expected deleted analog input lookup to fail")
	}
}
