package utils

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreCredentialsRepositoryGetAndUpdate(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	if err := store.CreateBucket("reef-pi"); err != nil {
		t.Fatal(err)
	}

	repo := newCredentialsRepository(store, "reef-pi")
	expected := Credentials{User: "reef-pi", Password: "secret"}
	if err := repo.Update(expected); err != nil {
		t.Fatal(err)
	}

	got, err := repo.Get()
	if err != nil {
		t.Fatal(err)
	}
	if got.User != expected.User || got.Password != expected.Password {
		t.Fatalf("expected credentials %#v, got %#v", expected, got)
	}
}
