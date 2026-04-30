package drivers

import (
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestDriverRepositoryCRUD(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repository, err := newDriverRepository(store)
	if err != nil {
		t.Fatal(err)
	}

	created, err := repository.create(Driver{
		Name:   "main",
		Type:   "pca9685",
		Config: json.RawMessage(`{"address":64}`),
		Parameters: map[string]interface{}{
			"Address": float64(64),
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if created.ID != "1" {
		t.Fatalf("Expected created driver ID 1, got %s", created.ID)
	}

	raw, err := store.RawGet(DriverBucket, created.ID)
	if err != nil {
		t.Fatal(err)
	}
	var stored map[string]interface{}
	if err := json.Unmarshal(raw, &stored); err != nil {
		t.Fatal(err)
	}
	if stored["id"] != created.ID || stored["name"] != "main" || stored["type"] != "pca9685" {
		t.Fatalf("Stored driver JSON shape changed: %#v", stored)
	}

	fetched, err := repository.get(created.ID)
	if err != nil {
		t.Fatal(err)
	}
	if fetched.ID != created.ID || fetched.Name != "main" || fetched.Type != "pca9685" {
		t.Fatalf("Fetched unexpected driver: %#v", fetched)
	}

	if err := repository.update(created.ID, Driver{Name: "updated", Type: "pca9685"}); err != nil {
		t.Fatal(err)
	}
	fetched, err = repository.get(created.ID)
	if err != nil {
		t.Fatal(err)
	}
	if fetched.ID != created.ID || fetched.Name != "updated" {
		t.Fatalf("Updated driver did not preserve requested ID: %#v", fetched)
	}

	drivers, err := repository.list()
	if err != nil {
		t.Fatal(err)
	}
	if len(drivers) != 1 || drivers[0].ID != created.ID {
		t.Fatalf("Expected one listed driver, got %#v", drivers)
	}

	if err := repository.delete(created.ID); err != nil {
		t.Fatal(err)
	}
	drivers, err = repository.list()
	if err != nil {
		t.Fatal(err)
	}
	if len(drivers) != 0 {
		t.Fatalf("Expected no listed drivers after delete, got %#v", drivers)
	}
}
