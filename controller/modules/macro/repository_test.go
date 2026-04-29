package macro

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

	macro := Macro{
		Name:  "Feed Mode",
		Steps: []Step{{Type: "equipment", Config: []byte(`{"id":"1","on":false}`)}},
	}
	if err := repo.Create(macro); err != nil {
		t.Fatal(err)
	}

	got, err := repo.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "1" || got.Name != "Feed Mode" {
		t.Fatalf("unexpected macro: %#v", got)
	}

	got.Name = "Maintenance Mode"
	if err := repo.Update(got.ID, got); err != nil {
		t.Fatal(err)
	}

	macros, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(macros) != 1 || macros[0].Name != "Maintenance Mode" {
		t.Fatalf("unexpected macros: %#v", macros)
	}

	if err := repo.Delete(got.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(got.ID); err == nil {
		t.Fatal("expected deleted macro lookup to fail")
	}
}
