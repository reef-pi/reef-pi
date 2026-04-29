package lighting

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

	light := Light{
		Name:   "Main Light",
		Jack:   "jack-1",
		Enable: true,
		Channels: map[int]*Channel{
			1: {Name: "white", Manual: true, Value: 55},
		},
	}
	created, err := repo.Create(light)
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
	if got.Name != "Main Light" || got.Jack != "jack-1" {
		t.Fatalf("unexpected light: %#v", got)
	}

	got.Name = "Frag Tank"
	if err := repo.Update(got.ID, got); err != nil {
		t.Fatal(err)
	}

	lights, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(lights) != 1 || lights[0].Name != "Frag Tank" {
		t.Fatalf("unexpected lights: %#v", lights)
	}

	if err := repo.Delete(got.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get(got.ID); err == nil {
		t.Fatal("expected deleted light lookup to fail")
	}
}
