package pca9685

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	driverif "github.com/reef-pi/reef-pi/controller/types/driver"
	"github.com/reef-pi/rpi/i2c"
	"github.com/stretchr/testify/assert"
)

func TestNewPCA9685(t *testing.T) {
	driver, err := NewPCA9685(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	meta := driver.Metadata()
	assert.Equal(t, "pca9685", meta.Name)
	assert.True(t, meta.Capabilities.PWM)

	pwmDriver, ok := driver.(driverif.PWM)
	assert.True(t, ok)
	assert.NotNil(t, pwmDriver)

	channels := pwmDriver.PWMChannels()
	assert.Len(t, channels, 16)

	channel15, err := pwmDriver.GetPWMChannel("15")
	assert.NoError(t, err)
	assert.NotNil(t, channel15)
}

func TestPca9685Channel_Set(t *testing.T) {
	driver, err := NewPCA9685(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	pwmDriver := driver.(driverif.PWM)
	assert.NotNil(t, pwmDriver)

	channel15, err := pwmDriver.GetPWMChannel("15")
	assert.NoError(t, err)

	err = channel15.Set(50)
	assert.NoError(t, err)

	err = channel15.Set(150)
	assert.Errorf(t, err, "invalid range didn't produce error")

	err = channel15.Set(-1)
	assert.Errorf(t, err, "invalid range didn't produce error")
}

func TestPca9685Driver_Close(t *testing.T) {
	driver, err := NewPCA9685(settings.DefaultSettings, i2c.MockBus())
	assert.NoError(t, err)

	pwmDriver := driver.(driverif.PWM)
	assert.NotNil(t, pwmDriver)

	err = driver.Close()
	assert.NoError(t, err)
}
