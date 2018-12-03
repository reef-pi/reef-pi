package drivers

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types"
	i2c2 "github.com/reef-pi/rpi/i2c"
	"github.com/stretchr/testify/assert"
)

type mockStore struct {
	types.Store
}

func newDrivers(t *testing.T) *Drivers {
	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	i2c := i2c2.MockBus()

	driver, err := NewDrivers(s, i2c, &mockStore{})
	assert.NoError(t, err)

	return driver
}

func TestNewDrivers(t *testing.T) {
	driver := newDrivers(t)

	assert.Len(t, driver.drivers, 2)
}

func TestDrivers_List(t *testing.T) {
	driver := newDrivers(t)
	meta, err := driver.List()
	assert.NoError(t, err)

	assert.Len(t, meta, 2)
	assert.Equal(t, "pca9685", meta[0].Name)
}

func TestDrivers_Get(t *testing.T) {
	drivers := newDrivers(t)
	driver, err := drivers.Get("rpi")
	assert.NoError(t, err)

	assert.Equal(t, "rpi", driver.Metadata().Name)
}
