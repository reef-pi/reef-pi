package mockpca9685

import (
	"testing"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/types/driver"
)

func TestNewMockDriver(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("mock driver error %v", err)
	}
	pwmDriver, ok := drvr.(driver.PWM)
	if !ok {
		t.Error("driver is now a PWM driver")
	}

	outputDriver, ok := drvr.(driver.Output)
	if !ok {
		t.Error("driver is not an output driver")
	}

	if l := len(pwmDriver.PWMChannels()); l != 8 {
		t.Errorf("unexpected number of mock channels: %d", l)
	}

	if l := len(outputDriver.OutputPins()); l != 8 {
		t.Errorf("unexpected number of mock pins: %d", l)
	}

	_, err = pwmDriver.GetPWMChannel("does not exist")
	if err == nil {
		t.Error("expected error on non-existent channel")
	}

	_, err = pwmDriver.GetPWMChannel("1")
	if err != nil {
		t.Errorf("error getting valid channel %v", err)
	}

	_, err = outputDriver.GetOutputPin("does not exist either")
	if err == nil {
		t.Error("expected error on non-existent pin")
	}

	_, err = outputDriver.GetOutputPin("1")
	if err != nil {
		t.Errorf("error getting valid pin %v", err)
	}

	err = drvr.Close()
	if err != nil {
		t.Errorf("error closing driver %v", err)
	}
}
