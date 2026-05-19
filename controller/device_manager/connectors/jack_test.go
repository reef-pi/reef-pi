package connectors

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestJacksAPI(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}

	drvrs := drivers.TestDrivers(store)
	d1 := drivers.Driver{
		Name:   "lighting",
		Type:   "pca9685",
		Config: []byte(`{"address":64, "frequency":1000}`),
	}
	if err := drvrs.Create(d1); err != nil {
		t.Fatal(err)
	}
	j := Jack{Name: "Foo", Pins: []int{0}, Driver: "rpi"}
	jacks := NewJacks(drvrs, store)
	if err := jacks.Setup(); err != nil {
		t.Fatal(err)
	}

	if err := jacks.Create(j); err != nil {
		t.Error("Failed to create jack:", err)
	}

	j.Driver = "1"
	if err := jacks.Update("1", j); err != nil {
		t.Error("Failed to update jack:", err)
	}

	// Create with no name should fail
	j.Name = ""
	if err := jacks.Create(j); err == nil {
		t.Error("Jack creation expected to fail when jack name is absent")
	}
	// Create with empty pins should fail
	j.Name = "zd"
	j.Pins = []int{}
	if err := jacks.Create(j); err == nil {
		t.Error("Jack creation expected to fail when jack pins are empty")
	}
	// Create with invalid pca9685 pin (>14) should fail
	j.Pins = []int{16}
	if err := jacks.Create(j); err == nil {
		t.Error("Jack creation expected to fail when pca9685 pin is invalid (not 0-14)")
	}
	// Create with rpi driver and invalid pin should fail
	j.Driver = "rpi"
	j.Pins = []int{3}
	if err := jacks.Create(j); err == nil {
		t.Error("Jack creation expected to fail when rpi pin is invalid (not 0 or 1)")
	}
	// Update with invalid driver should fail
	j.Driver = ""
	j.Pins = []int{0}
	if err := jacks.Update("1", j); err == nil {
		t.Error("Jack update expected to fail when driver is invalid")
	}

	if _, err := jacks.Get("1"); err != nil {
		t.Error("Failed to get jack:", err)
	}
	if _, err := jacks.List(); err != nil {
		t.Error("Failed to list jacks:", err)
	}

	pinValues := PinValues{0: 73}
	if err := jacks.Control("1", pinValues); err != nil {
		t.Error("Failed to control jack:", err)
	}
	if err := jacks.Delete("1"); err != nil {
		t.Error("Failed to delete jack:", err)
	}
}
