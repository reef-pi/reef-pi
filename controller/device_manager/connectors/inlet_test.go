package connectors

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestInletsAPI(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()
	if err != nil {
		t.Fatal(err)
	}
	drvrs := drivers.TestDrivers(store)

	i := Inlet{Name: "Foo", Pin: 21, Driver: "rpi"}
	inlets := NewInlets(drvrs, store)

	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}

	if err := inlets.Create(i); err != nil {
		t.Error("Failed to create inlet:", err)
	}
	i.Equipment = "1"
	if err := inlets.Update("1", i); err != nil {
		t.Error("Failed to update inlet:", err)
	}
	if _, err := inlets.List(); err != nil {
		t.Error("Failed to list inlets:", err)
	}
	if _, err := inlets.Read("1"); err != nil {
		t.Error("Failed to read inlet:", err)
	}

	// Create with no name should fail
	i.Name = ""
	if err := inlets.Create(i); err == nil {
		t.Error("Inlet creation expected to fail when name is not set")
	}
	// Update with invalid pin should fail
	i.Name = "zsd"
	i.Pin = 1
	if err := inlets.Update("1", i); err == nil {
		t.Error("Inlet update expected to fail when GPIO pin number is not valid")
	}

	if _, err := inlets.Get("1"); err != nil {
		t.Error("Failed to get inlet:", err)
	}
	// Delete should fail since equipment is assigned
	if err := inlets.Delete("1"); err == nil {
		t.Error("Inlet deletion expected to fail due to equipment being assigned to it")
	}
	i.Equipment = ""
	i.Pin = 16
	if err := inlets.Update("1", i); err != nil {
		t.Error("Failed to update inlet:", err)
	}
	if err := inlets.Delete("1"); err != nil {
		t.Error("Failed to delete inlet:", err)
	}
}
