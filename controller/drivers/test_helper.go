package drivers

import (
	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestDrivers(store storage.Store) *Drivers {
	setting := settings.DefaultSettings
	setting.Capabilities.DevMode = true
	bus := i2c.MockBus()
	bus.Bytes = make([]byte, 2)
	driver, err := NewDrivers(setting, bus, store)
	if err != nil {
		panic(err)
	}
	return driver
}
