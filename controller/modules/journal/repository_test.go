package journal

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

	param := Parameter{Name: "Salinity", Unit: "ppt", Description: "Salt level"}
	created, err := repo.Create(param)
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
	if got.ID != "1" || got.Name != "Salinity" || got.Unit != "ppt" {
		t.Fatalf("unexpected parameter: %#v", got)
	}

	got.ID = "stale"
	got.Name = "Alkalinity"
	if err := repo.Update(created.ID, got); err != nil {
		t.Fatal(err)
	}

	params, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(params) != 1 || params[0].ID != "1" || params[0].Name != "Alkalinity" {
		t.Fatalf("unexpected parameters: %#v", params)
	}

	if err := repo.Delete(created.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(created.ID); err == nil {
		t.Fatal("expected deleted parameter lookup to fail")
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

	created, err := repo.Create(Parameter{Name: "pH", Unit: "pH"})
	if err != nil {
		t.Fatal(err)
	}
	if err := store.CreateWithID(UsageBucket, created.ID, []Entry{{Value: 8.2}}); err != nil {
		t.Fatal(err)
	}

	if err := repo.Delete(created.ID); err != nil {
		t.Fatal(err)
	}

	var entries []Entry
	if err := store.Get(UsageBucket, created.ID, &entries); err == nil {
		t.Fatal("expected deleted usage lookup to fail")
	}
}
