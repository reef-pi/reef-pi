package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"os"
	"testing"
)

func TestDevModeDetection(t *testing.T) {
	store := new(utils.FakeStore)
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
