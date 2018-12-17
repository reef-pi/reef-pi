package drivers

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	i2c2 "github.com/reef-pi/rpi/i2c"
)

type mockStore struct {
	storage.Store
}

func newDrivers(t *testing.T) *Drivers {
	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	i2c := i2c2.MockBus()

	driver, err := NewDrivers(s, i2c, &mockStore{})
	if err != nil {
		t.Fatalf("drivers store could not be built")
	}

	return driver
}

func TestNewDrivers(t *testing.T) {
	driver := newDrivers(t)
	if len(driver.drivers) != 2 {
		t.Error("unexpected number of mock drivers returned")
	}
}

func TestDrivers_List(t *testing.T) {
	driver := newDrivers(t)
	meta, err := driver.List()
	if err != nil {
		t.Errorf("unexpected error returning drivers %v", err)
	}

	if len(meta) != 2 {
		t.Error("list API didn't return two drivers")
	}

	if meta[0].Name != "pca9685" {
		t.Error("driver list did not return sorted results")
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
