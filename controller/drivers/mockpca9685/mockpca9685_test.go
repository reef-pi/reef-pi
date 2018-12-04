package mockpca9685

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

	pwmDriver, ok := drvr.(driver.PWM)
	assert.True(t, ok)

	outputDriver, ok := drvr.(driver.Output)
	assert.True(t, ok)

	assert.Len(t, pwmDriver.PWMChannels(), 8)
	assert.Len(t, outputDriver.OutputPins(), 8)

	_, err = pwmDriver.GetPWMChannel("does not exist")
	assert.Error(t, err)

	_, err = pwmDriver.GetPWMChannel("1")
	assert.NoError(t, err)

	_, err = outputDriver.GetOutputPin("does not exist either")
	assert.Error(t, err)

	_, err = outputDriver.GetOutputPin("1")
	assert.NoError(t, err)

	err = drvr.Close()
	assert.NoError(t, err)
}
