package utils

import (
	"github.com/reef-pi/rpi/i2c"
	"testing"
)

func TestPWM(t *testing.T) {
	config := DefaultPWMConfig
	config.DevMode = true
	pwm, err := NewPWM(i2c.MockBus(), config)
	if err != nil {
		t.Fatal("Failed to inititalize pwm sub system. Error:", err)
	}
	if err := pwm.Start(); err != nil {
		t.Fatal("Failed to start pwm, Error:", err)
	}
	if err := pwm.Set(1, 12); err != nil {
		t.Fatal("Failed to set pwm value, Error:", err)
	}
	if i, _ := pwm.Get(1); i != 491 {
		t.Fatal("Failed to persist pwm value. Expected 12, found:", i)
	}
	if err := pwm.On(1); err != nil {
		t.Fatal("Failed to switch on pwm pin. Error:", err)
	}
	if err := pwm.Off(1); err != nil {
		t.Fatal("Failed to switch off pwm pin. Error:", err)
	}
	if err := pwm.Stop(); err != nil {
		t.Fatal("Failed to stop pwm subsystem. Error:", err)
	}
}
