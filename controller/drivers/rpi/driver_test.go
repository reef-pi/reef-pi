package rpi

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	driverif "github.com/reef-pi/reef-pi/controller/types/driver"
)

func newDriver(t *testing.T) (*rpiDriver, driverif.Driver) {
	s := settings.DefaultSettings
	s.RPI_PWMFreq = 100

	realDriver := &rpiDriver{
		newDigitalPin: newMockDigitalPin,
		newPwmDriver:  newMockPWMDriver,
	}

	err := realDriver.init(s)
	if err != nil {
		t.Fatalf("can't make driver due to error: %v", err)
	}
	var driver driverif.Driver = realDriver
	return realDriver, driver
}

func TestNewRPiDriver(t *testing.T) {
	_, driver := newDriver(t)

	meta := driver.Metadata()
	if meta.Name != "rpi" {
		t.Error("driver name wasn't rpi")
	}
	if !(meta.Capabilities.PWM &&
		meta.Capabilities.Input &&
		meta.Capabilities.Output) {
		t.Error("didn't find expected capabilities")
	}
	if meta.Capabilities.PH {
		t.Error("rpi can't provide pH")
	}

	input, ok := driver.(driverif.Input)
	if !ok {
		t.Error("driver is not an input driver")
	}
	pins := input.InputPins()
	if l := len(validGPIOPins); l != len(pins) {
		t.Error("didn't get expected number of input GPIO pins")
	}

	output, ok := driver.(driverif.Output)
	if !ok {
		t.Error("driver is not an output driver")
	}
	outPins := output.OutputPins()
	if l := len(validGPIOPins); l != len(outPins) {
		t.Errorf("didn't get expected number of output GPIO pins")
	}
}

func TestRpiDriver_Close(t *testing.T) {
	realDriver, driver := newDriver(t)

	err := driver.Close()
	if err != nil {
		t.Errorf("unexpected error closing driver %v", err)
	}
	for _, pin := range realDriver.pins {
		realPin := pin.digitalPin.(*mockDigitalPin)
		if !realPin.closed {
			t.Errorf("pin %v wasn't closed", realPin)
		}
	}
}

func TestRpiDriver_InputPins(t *testing.T) {
	_, driver := newDriver(t)

	input := driver.(driverif.Input)
	output := driver.(driverif.Output)

	ipins := input.InputPins()
	opins := output.OutputPins()
	if ipins[0].Name() != opins[0].Name() {
		t.Error("input and output pins don't match")
	}

	v, err := ipins[0].Read()
	if err != nil {
		t.Errorf("unexpected error reading pin %v", err)
	}
	if v {
		t.Error("expected pin to be low")
	}
	err = opins[1].Write(true)
	if err != nil {
		t.Errorf("unexpected error writing pin %v", err)
	}

	v, err = ipins[1].Read()
	if err != nil {
		t.Errorf("unexpected error reading pin %v", err)
	}
	if !v {
		t.Error("expected pin to be high")
	}
}

func TestRpiDriver_GetOutputPin(t *testing.T) {
	_, driver := newDriver(t)
	output := driver.(driverif.Output)

	pin, err := output.GetOutputPin("GP26")
	if err != nil {
		t.Errorf("could not get output pin %v", err)
	}
	if pin.Name() != "GP26" {
		t.Errorf("pin name %s was not GP26", pin.Name())
	}
}

func TestRpiDriver_GetPWMChannel(t *testing.T) {
	_, driver := newDriver(t)
	pwmDriver := driver.(driverif.PWM)

	ch, err := pwmDriver.GetPWMChannel("0")
	if err != nil {
		t.Errorf("unexpected error getting pwm channel %v", err)
	}
	if name := ch.Name(); name != "0" {
		t.Error("PWM channel was not named '0'")
	}

	err = ch.Set(10)
	if err != nil {
		t.Errorf("unexpected error setting PWM %v", err)
	}

	backingChannel := ch.(*rpiPwmChannel)
	backingDriver := backingChannel.driver.(*mockPwmDriver)

	if s := backingDriver.setting[0]; s != 100000 {
		t.Errorf("backing driver not reporting 100000, got %d", s)
	}
	if !backingDriver.enabled[0] {
		t.Error("backing driver was not enabled")
	}

}
