package pca9685

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	driverif "github.com/reef-pi/reef-pi/controller/types/driver"
	"github.com/reef-pi/rpi/i2c"
)

func TestNewPCA9685(t *testing.T) {
	driver, err := NewPCA9685(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("unexpected error making driver %v", err)
	}

	meta := driver.Metadata()
	if meta.Name != "pca9685" {
		t.Errorf("name %s did not match pca9685", meta.Name)
	}
	if !meta.Capabilities.PWM {
		t.Error("driver didn't indicate it supports PWM")
	}

	pwmDriver, ok := driver.(driverif.PWM)
	if !ok {
		t.Error("driver is not a PWM interface")
	}
	if pwmDriver == nil {
		t.Error("driver is nil")
	}

	channels := pwmDriver.PWMChannels()
	if l := len(channels); l != 16 {
		t.Errorf("expected 16 channels, got %d", l)
	}

	channel15, err := pwmDriver.GetPWMChannel("15")
	if err != nil {
		t.Errorf("error fetching channel 15 %v", err)
	}
	if channel15 == nil {
		t.Error("nil pwm driver")
	}
}

func TestPca9685Channel_Set(t *testing.T) {
	driver, err := NewPCA9685(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("unexpected error making driver %v", err)
	}

	pwmDriver := driver.(driverif.PWM)
	channel15, err := pwmDriver.GetPWMChannel("15")
	if err != nil {
		t.Errorf("error fetching channel 15 %v", err)
	}

	err = channel15.Set(50)
	if err != nil {
		t.Error("can't set channel to 50%")
	}

	err = channel15.Set(150)
	if err == nil {
		t.Error("channel 15 allowed setting 150%")
	}

	err = channel15.Set(-1)
	if err == nil {
		t.Error("channel 15 allowed setting -1%")
	}
}

func TestPca9685Driver_Close(t *testing.T) {
	driver, err := NewPCA9685(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("unexpected error making driver %v", err)
	}

	err = driver.Close()
	if err != nil {
		t.Errorf("unexpected error closing driver %v", err)
	}
}
