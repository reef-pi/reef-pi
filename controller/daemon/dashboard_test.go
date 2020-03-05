package daemon

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestDashboard(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}
	d, err := initializeDashboard(store)
	if err != nil {
		t.Error(err)
	}
	if d.Width != 500 {
		t.Error("Expected 500, found:", d.Width)
	}
	if d.Height != 300 {
		t.Error("Expected 300, found:", d.Width)
	}
}
