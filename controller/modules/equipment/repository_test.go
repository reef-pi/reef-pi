package equipment

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

	eq := Equipment{
		Name:          "Return Pump",
		Outlet:        "1",
		On:            true,
		StayOffOnBoot: true,
		BootDelay:     5,
	}
	created, err := repo.Create(eq)
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
	if got.ID != "1" || got.Name != "Return Pump" || got.Outlet != "1" || !got.On || !got.StayOffOnBoot || got.BootDelay != 5 {
		t.Fatalf("unexpected equipment: %#v", got)
	}

	got.Name = "Skimmer"
	got.On = false
	if err := repo.Update(got.ID, got); err != nil {
		t.Fatal(err)
	}

	equipment, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(equipment) != 1 || equipment[0].Name != "Skimmer" || equipment[0].On {
		t.Fatalf("unexpected equipment list: %#v", equipment)
	}

	if err := repo.Delete(got.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(got.ID); err == nil {
		t.Fatal("expected deleted equipment lookup to fail")
	}
}
