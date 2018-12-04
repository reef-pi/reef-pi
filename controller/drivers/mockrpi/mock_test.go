package mockrpi

import (
	"github.com/reef-pi/rpi/i2c"
	"testing"

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
