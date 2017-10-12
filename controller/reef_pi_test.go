package controller

import (
	"testing"
)

func TestReefPi(t *testing.T) {
	conf, err := ParseConfig("../build/reef-pi.yml")
	if err != nil {
		t.Fatal("Failed to parse example config file. Error:", err)
	}

	r, err := New("0.1", conf.Database)
	if err != nil {
		t.Fatal("Failed to create new reef-pi controller. Error:", err)
	}
	if err := r.Start(); err != nil {
		t.Fatal("Failed to load subsystem. Error:", err)
	}
	if err := r.Stop(); err != nil {
		t.Fatal(err)
	}
}
