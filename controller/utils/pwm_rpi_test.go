package utils

import (
	"testing"
)

func TestRPIPWMDriver(t *testing.T) {
	d := NewRPIPWMDriver()
	if err := d.Start(); err != nil {
		t.Error(err)
	}
	if err := d.Stop(); err != nil {
		t.Error(err)
	}
}
