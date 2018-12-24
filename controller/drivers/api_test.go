package drivers

import (
	"bytes"
	"testing"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller/utils"

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

func TestDrivers_ListByCapabilities(t *testing.T) {
	driver := newDrivers(t)
	filter := hal.Capabilities{
		Output: true,
		Input:  true,
	}
	drivers, err := driver.ListByCapabilities(filter)
	if err != nil {
		t.Errorf("unexpected error returning drivers %v", err)
	}
	if len(drivers) != 1 {
		t.Errorf("filtering didn't return a single mock driver")
	}
	if drivers[0].Name != "rpi" {
		t.Errorf("expected to get the rpi driver back")
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

func TestDrivers_listInputs(t *testing.T) {
	drivers := newDrivers(t)

	tr := utils.NewTestRouter()
	drivers.LoadAPI(tr.Router)
	names := Names{}
	if err := tr.Do("GET", "/api/drivers/rpi/inputs", new(bytes.Buffer), &names); err != nil {
		t.Errorf("API response error %v", err)
	}

	if names.Capability != "input" {
		t.Errorf("invalid capability %v", names.Capability)
	}

	if l := len(names.Names); l != 26 {
		t.Errorf("unexpected driver length returned: %d", l)
	}

	if err := tr.Do("GET", "/api/drivers/nonexistant/inputs", new(bytes.Buffer), &names); err == nil {
		t.Errorf("expected an error for a nonexistant driver")
	}
}
