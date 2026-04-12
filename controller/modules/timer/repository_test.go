package timer

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestStoreRepositoryCreateAssignsID(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repo := newRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	job, err := repo.Create(Job{Name: "test"})
	if err != nil {
		t.Fatal(err)
	}
	if job.ID == "" {
		t.Fatal("expected repository to assign an id")
	}

	stored, err := repo.Get(job.ID)
	if err != nil {
		t.Fatal(err)
	}
	if stored.Name != "test" {
		t.Fatalf("expected stored job name %q, got %q", "test", stored.Name)
	}
}
