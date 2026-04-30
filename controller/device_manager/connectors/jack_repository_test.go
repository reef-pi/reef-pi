package connectors

import (
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestJackRepositoryCRUD(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	repository := newJackRepository(store)
	if err := repository.Setup(); err != nil {
		t.Fatal(err)
	}

	jack := Jack{
		Name:    "main",
		Pins:    []int{0, 1},
		Driver:  "rpi",
		Reverse: true,
	}
	if err := repository.Create(jack); err != nil {
		t.Fatal(err)
	}

	fetched, err := repository.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if fetched.ID != "1" || fetched.Name != "main" || fetched.Driver != "rpi" || !fetched.Reverse {
		t.Fatalf("Fetched unexpected jack: %#v", fetched)
	}
	if len(fetched.Pins) != 2 || fetched.Pins[0] != 0 || fetched.Pins[1] != 1 {
		t.Fatalf("Fetched unexpected jack pins: %#v", fetched.Pins)
	}

	raw, err := store.RawGet(JackBucket, fetched.ID)
	if err != nil {
		t.Fatal(err)
	}
	var stored map[string]interface{}
	if err := json.Unmarshal(raw, &stored); err != nil {
		t.Fatal(err)
	}
	if stored["id"] != fetched.ID || stored["name"] != "main" || stored["driver"] != "rpi" || stored["reverse"] != true {
		t.Fatalf("Stored jack JSON shape changed: %#v", stored)
	}
	pins, ok := stored["pins"].([]interface{})
	if !ok || len(pins) != 2 || pins[0] != float64(0) || pins[1] != float64(1) {
		t.Fatalf("Stored jack pins changed: %#v", stored["pins"])
	}

	if err := repository.Update(fetched.ID, Jack{Name: "updated", Pins: []int{1}, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}
	fetched, err = repository.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if fetched.ID != "1" || fetched.Name != "updated" || len(fetched.Pins) != 1 || fetched.Pins[0] != 1 {
		t.Fatalf("Updated jack did not preserve requested ID: %#v", fetched)
	}

	jacks, err := repository.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(jacks) != 1 || jacks[0].ID != "1" {
		t.Fatalf("Expected one listed jack, got %#v", jacks)
	}

	if err := repository.Delete("1"); err != nil {
		t.Fatal(err)
	}
	jacks, err = repository.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(jacks) != 0 {
		t.Fatalf("Expected no listed jacks after delete, got %#v", jacks)
	}
}
