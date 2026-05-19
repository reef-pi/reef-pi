package connectors

import (
	"testing"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestAnalogInputsAPI(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}

	drvrs := drivers.TestDrivers(store)
	d1 := drivers.Driver{
		Name:   "pH Board",
		Type:   "ph-board",
		Config: []byte(`{"address":64}`),
	}
	if err := drvrs.Create(d1); err != nil {
		t.Fatal(err)
	}
	j := AnalogInput{Name: "Foo", Pin: 0, Driver: "1"}
	ais := NewAnalogInputs(drvrs, store)
	if err := ais.Setup(); err != nil {
		t.Fatal(err)
	}

	if err := ais.Create(j); err != nil {
		t.Error("Failed to create analog input:", err)
	}

	j.Driver = "1"
	if err := ais.Update("1", j); err != nil {
		t.Error("Failed to update analog input:", err)
	}

	// Create with no name should fail
	j.Name = ""
	if err := ais.Create(j); err == nil {
		t.Error("AnalogInput creation expected to fail when analog_input name is absent")
	}
	// Create with invalid pin should fail
	j.Pin = 16
	if err := ais.Create(j); err == nil {
		t.Error("AnalogInput creation expected to fail when pca9685 pin is invalid (not 0-14)")
	}
	// Update with invalid driver should fail
	j.Driver = ""
	if err := ais.Update("1", j); err == nil {
		t.Error("AnalogInput update expected to fail when driver is invalid")
	}

	if _, err := ais.Get("1"); err != nil {
		t.Error("Failed to get analog input:", err)
	}
	if err := ais.Calibrate("1", []hal.Measurement{}); err != nil {
		t.Error("Failed to calibrate analog input:", err)
	}
	if _, err := ais.List(); err != nil {
		t.Error("Failed to list analog inputs:", err)
	}
	if _, err := ais.Read("1"); err != nil {
		t.Error("Failed to read analog input:", err)
	}
	if err := ais.Delete("1"); err != nil {
		t.Error("Failed to delete analog input:", err)
	}
}
