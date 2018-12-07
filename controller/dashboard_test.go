package controller

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestDashboard(t *testing.T) {
	store, err := utils.TestDB()
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
