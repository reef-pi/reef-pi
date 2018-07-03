package utils

import (
	"testing"
)

func TestRPIPWMDriver(t *testing.T) {
	d := NewRPIPWMDriver(100, true)
	if err := d.Start(); err != nil {
		t.Error(err)
	}
	if err := d.Stop(); err != nil {
		t.Error(err)
	}
}
