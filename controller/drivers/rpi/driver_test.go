package rpi

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	driverif "github.com/reef-pi/reef-pi/controller/types/driver"
	"github.com/stretchr/testify/assert"
)

func newDriver(t *testing.T) (*rpiDriver, driverif.Driver) {
	s := settings.DefaultSettings
	s.RPI_PWMFreq = 100

	realDriver := &rpiDriver{
		newDigitalPin: newMockDigitalPin,
		newPwmDriver: newMockPWMDriver,
	}

	err := realDriver.init(s)
	assert.NoError(t, err)

	var driver driverif.Driver = realDriver
	return realDriver, driver
}

func TestNewRPiDriver(t *testing.T) {

	_, driver := newDriver(t)

	meta := driver.Metadata()
	assert.Equal(t, "rpi", meta.Name)
	assert.True(t, meta.Capabilities.PWM)
	assert.True(t, meta.Capabilities.Input)
	assert.True(t, meta.Capabilities.Output)
	assert.False(t, meta.Capabilities.PH)

	input, ok := driver.(driverif.Input)
	assert.True(t, ok)
	pins := input.InputPins()
	assert.Len(t, pins, len(validGPIOPins))

	output, ok := driver.(driverif.Output)
	assert.True(t, ok)
	outPins := output.OutputPins()
	assert.Len(t, outPins, len(validGPIOPins))

}

func TestRpiDriver_Close(t *testing.T) {
	realDriver, driver := newDriver(t)

	err := driver.Close()
	assert.NoError(t, err)

	for _, pin := range realDriver.pins {
		realPin := pin.digitalPin.(*mockDigitalPin)
		assert.True(t, realPin.closed)
	}
}

func TestRpiDriver_InputPins(t *testing.T) {
	_, driver := newDriver(t)

	input, ok := driver.(driverif.Input)
	assert.True(t, ok)

	output, ok := driver.(driverif.Output)
	assert.True(t, ok)

	ipins := input.InputPins()
	opins := output.OutputPins()
	assert.Equal(t, ipins[0].Name(), opins[0].Name())

	v, err := ipins[0].Read()
	assert.NoError(t, err)
	assert.False(t, v)
	assert.NoError(t, opins[0].Write(true))

	v, err = ipins[0].Read()
	assert.NoError(t, err)
	assert.True(t, v)
}