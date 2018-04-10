package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestDashboard(t *testing.T) {
	store := new(utils.FakeStore)
	d, err := initializeDashboard(store)
	if err != nil {
		t.Error(err)
	}
	if d.Width != 0 {
		t.Error("Expected 0, found:", d.Width)
	}
	if d.Height != 0 {
		t.Error("Expected 0, found:", d.Width)
	}
}
