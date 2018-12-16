package controller

import (
	"os"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestDevModeDetection(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	os.Unsetenv("DEV_MODE")
	s, err := initializeSettings(store)
	if err != nil {
		t.Error(err)
	}
	if s.Capabilities.DevMode {
		t.Error("Devmode is turned on, expected off")
	}
	os.Setenv("DEV_MODE", "1")
	s, err = initializeSettings(store)
	if err != nil {
		t.Error(err)
	}
	if !s.Capabilities.DevMode {
		t.Error("Devmode is turned off, expected on")
	}
	os.Unsetenv("DEV_MODE")
}
