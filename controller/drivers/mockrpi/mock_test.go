package mockrpi

import (
	"testing"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"
)

func TestNewMockDriver(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("unexpected error making mock driver %v", err)
	}

	_, ok := drvr.(driver.Input)
	if !ok {
		t.Error("mock driver is not an input driver")
	}

	_, ok = drvr.(driver.Output)
	if !ok {
		t.Error("mock driver is not an output driver")
	}

	_, ok = drvr.(driver.PWM)
	if !ok {
		t.Error("mock driver is not a PWM driver")
	}
}

func TestMockDriver_GetInputPin(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("unexpected error making mock driver %v", err)
	}

	in, ok := drvr.(driver.Input)
	if !ok {
		t.Error("mock driver is not an input driver")
	}

	pin, err := in.GetInputPin("GP21")
	if err != nil {
		t.Errorf("error getting mock pin GP21: %v", err)
	}
	if pin == nil {
		t.Error("pin was nil")
	}

	v, err := pin.Read()
	if err != nil {
		t.Errorf("pin read error %v", err)
	}
	if v != false {
		t.Error("pin read returned true")
	}
}

func TestMockDriver_InputPins(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("error making mock driver %v", err)
	}

	in := drvr.(driver.Input)
	pins := in.InputPins()
	if l := len(pins); l != 6 {
		t.Errorf("unexpected number of pins, got %d", l)
	}
}

func TestMockDriver_GetOutputPin(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("error making mock driver %v", err)
	}

	in := drvr.(driver.Output)

	pin, err := in.GetOutputPin("GP21")
	if err != nil {
		t.Errorf("can't get output pin GP21 %v", err)
	}

	if err := pin.Write(true); err != nil {
		t.Errorf("can't write to pin %v", err)
	}
	if pin.LastState() != true {
		t.Errorf("pin didn't toggle to on")
	}
}

func TestMockDriver_OutputPins(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("error making mock driver %v", err)
	}

	in := drvr.(driver.Output)
	pins := in.OutputPins()

	if l := len(pins); l != 6 {
		t.Errorf("expected 6 pins, got %d", l)
	}
}

func TestMockDriver_PWMChannels(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("error making mock driver %v", err)
	}

	pwm := drvr.(driver.PWM)
	if l := len(pwm.PWMChannels()); l != 2 {
		t.Errorf("expected 2 PWM channels, got %d", l)
	}
}

func TestMockDriver_GetPWMChannel(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	if err != nil {
		t.Errorf("error making mock driver %v", err)
	}

	pwm := drvr.(driver.PWM)
	ch, err := pwm.GetPWMChannel("0")
	if err != nil {
		t.Errorf("can't get PWM channel '0'")
	}

	if err := ch.Set(100); err != nil {
		t.Error("unexpected error setting PWM to 100")
	}
	if err := ch.Set(101); err == nil {
		t.Error("didn't get error when setting PWM to 101")
	}
}
