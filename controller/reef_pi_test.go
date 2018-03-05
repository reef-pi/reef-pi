package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestReefPi(t *testing.T) {
	conf, err := ParseConfig("../build/reef-pi.yml")
	if err != nil {
		t.Fatal("Failed to parse example config file. Error:", err)
	}
	store, err := utils.NewStore(conf.Database)
	if err != nil {
		t.Fatal(err)
	}
	initializeSettings(store)
	s := DefaultSettings
	s.Capabilities.DevMode = true
	if err := store.Update(Bucket, "settings", s); err != nil {
		t.Fatal(err)
	}
	store.Close()

	r, err := New("0.1", conf.Database)
	if err != nil {
		t.Fatal("Failed to create new reef-pi controller. Error:", err)
	}
	r.settings.Capabilities.DevMode = true
	r.settings.Capabilities.Doser = true
	r.settings.Capabilities.Lighting = true
	r.settings.Capabilities.Camera = true
	if err := r.Start(); err != nil {
		t.Fatal("Failed to load subsystem. Error:", err)
	}
	if err := r.Stop(); err != nil {
		t.Fatal(err)
	}
}
