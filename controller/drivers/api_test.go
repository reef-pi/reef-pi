package drivers

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/rpi/i2c"
)

func newDrivers(t *testing.T) *Drivers {
	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	bus := i2c.MockBus()
	store, err := storage.TestDB()
	if err != nil {
		t.Error(err)
	}

	driver, err := NewDrivers(s, bus, store)
	if err != nil {
		t.Fatalf("drivers store could not be built")
	}
	d1 := Driver{
		Name:   "foo",
		ID:     "0",
		Type:   "pca9685",
		Config: []byte(`{}`),
	}
	if err := driver.Create(d1); err != nil {
		t.Error(err)
	}
	return driver
}

func TestNewDrivers(t *testing.T) {
	driver := newDrivers(t)
	if len(driver.drivers) != 2 {
		t.Error("unexpected number of drivers returned", len(driver.drivers))
	}
}

func TestDrivers_List(t *testing.T) {
	driver := newDrivers(t)
	meta, err := driver.List()
	if err != nil {
		t.Errorf("unexpected error returning drivers %v", err)
	}

	if len(meta) != 1 {
		t.Error("list API returned", len(meta), "drivers")
	}

}

func TestDrivers_Get(t *testing.T) {
	drivers := newDrivers(t)
	driver, err := drivers.Get("rpi")
	if err != nil {
		t.Errorf("couldn't get rpi driver due to error %v", err)
	}

	if driver.Metadata().Name != "rpi" {
		t.Error("rpi driver isn't called rpi")
	}
}
