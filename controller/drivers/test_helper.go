package drivers

import (
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/rpi/i2c"
)

func TestDrivers(store storage.Store) *Drivers {
	setting := settings.DefaultSettings
	setting.Capabilities.DevMode = true
	driver, err := NewDrivers(setting, i2c.MockBus(), store)
	if err != nil {
		panic(err)
	}
	return driver
}
