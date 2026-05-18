package connectors

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestOutletsAPI(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}
	drvrs := drivers.TestDrivers(store)

	o := Outlet{Name: "Foo", Pin: 21, Driver: "rpi"}
	outlets := NewOutlets(drvrs, store)
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}

	if err := outlets.Create(o); err != nil {
		t.Error("Failed to create outlet:", err)
	}
	o.Name = "Bar"
	if err := outlets.Update("1", o); err != nil {
		t.Error("Failed to update outlet:", err)
	}
	if _, err := outlets.Get("1"); err != nil {
		t.Error("Failed to get outlet:", err)
	}
	if _, err := outlets.List(); err != nil {
		t.Error("Failed to list outlets:", err)
	}
	if err := outlets.Configure("1", false); err != nil {
		t.Error("Failed to configure outlet:", err)
	}
	o.Equipment = "1"
	if err := outlets.Update("1", o); err != nil {
		t.Error(err)
	}
	if err := outlets.Delete("1"); err == nil {
		t.Error("Expected to fail outlet deletion since equipment is attached to it")
	}
	o.Equipment = ""
	o.Name = "asd"
	if err := outlets.Update("1", o); err != nil {
		t.Error(err)
	}
	if err := outlets.Delete("1"); err != nil {
		t.Error("Failed to delete outlet:", err)
	}

	o.Name = ""
	if err := o.IsValid(drvrs); err == nil {
		t.Errorf("Outlet validation should fail if name is not set")
	}
	o.Name = "zsda"
	o.Pin = 1
	if err := o.IsValid(drvrs); err == nil {
		t.Errorf("Outlet validation should fail if GPIO pin is not valid")
	}
}
