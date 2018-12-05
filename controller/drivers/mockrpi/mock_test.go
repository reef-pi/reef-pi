package mockrpi

import (
	"testing"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"
	"github.com/stretchr/testify/assert"
)

func TestNewMockDriver(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	_, ok := drvr.(driver.Input)
	assert.True(t, ok)

	_, ok = drvr.(driver.Output)
	assert.True(t, ok)

	_, ok = drvr.(driver.PWM)
	assert.True(t, ok)
}

func TestMockDriver_GetInputPin(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	in, ok := drvr.(driver.Input)
	assert.True(t, ok)

	pin, err := in.GetInputPin("GP21")
	assert.NoError(t, err)
	assert.NotNil(t, pin)

	v, err := pin.Read()
	assert.NoError(t, err)
	assert.False(t, v)
}

func TestMockDriver_InputPins(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	in, ok := drvr.(driver.Input)
	assert.True(t, ok)

	pins := in.InputPins()
	assert.Len(t, pins, 6)
}

func TestMockDriver_GetOutputPin(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	in, ok := drvr.(driver.Output)
	assert.True(t, ok)

	pin, err := in.GetOutputPin("GP21")
	assert.NoError(t, err)
	assert.NotNil(t, pin)

	assert.NoError(t, pin.Write(true))
	assert.True(t, pin.LastState())
}

func TestMockDriver_OutputPins(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	in, ok := drvr.(driver.Output)
	assert.True(t, ok)

	pins := in.OutputPins()
	assert.Len(t, pins, 6)
}

func TestMockDriver_PWMChannels(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	pwm, ok := drvr.(driver.PWM)
	assert.True(t, ok)

	assert.Len(t, pwm.PWMChannels(), 2)
}

func TestMockDriver_GetPWMChannel(t *testing.T) {
	drvr, err := NewMockDriver(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	pwm, ok := drvr.(driver.PWM)
	assert.True(t, ok)

	ch, err := pwm.GetPWMChannel("0")
	assert.NoError(t, err)

	assert.NoError(t, ch.Set(100))
	assert.Error(t, ch.Set(101))
}
