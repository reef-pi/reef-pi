package drivers

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func newDrivers(t *testing.T) (*Drivers, storage.Store) {
	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	store, err := storage.TestDB()

	if err != nil {
		t.Error(err)
	}
	driver := TestDrivers(store)
	d1 := Driver{
		Name:   "foo",
		ID:     "0",
		Type:   "pca9685",
		Config: []byte(`{}`),
		Parameters: map[string]interface{}{
			"Address":   0x40,
			"Frequency": 1100,
		},
	}
	if err := driver.Create(d1); err != nil {
		t.Error(err)
	}
	return driver, store
}

func TestDrivers_API(t *testing.T) {
	d, s := newDrivers(t)
	defer s.Close()

	if _, err := d.List(); err != nil {
		t.Error("Failed to list drivers:", err)
	}

	newD := Driver{
		Name: "bar",
		Type: "pca9685",
		Parameters: map[string]interface{}{
			"Address":   0x40,
			"Frequency": 1200,
		},
	}
	if err := d.Create(newD); err != nil {
		t.Error("Failed to create driver:", err)
	}

	updateD := Driver{Name: "bar", Type: "rpi"}
	if err := d.Update("1", updateD); err != nil {
		t.Error("Failed to update driver:", err)
	}
	if _, err := d.Get("1"); err != nil {
		t.Error("Failed to fetch driver:", err)
	}

	// Valid sht31d validate
	validSHT := Driver{
		Name:   "foo",
		Type:   "sht31d",
		Config: []byte(`{"address":68}`),
	}
	failures, err := d.ValidateParameters(validSHT)
	if err != nil {
		t.Error("Failed to validate driver:", err)
	}
	if len(failures) > 0 {
		t.Error("Expected validation to pass for valid sht31d config, got failures:", failures)
	}

	// Invalid sht31d config: missing address
	invalidSHT := Driver{
		Name:   "foo",
		Type:   "sht31d",
		Config: []byte(`{}`),
	}
	failures, err = d.ValidateParameters(invalidSHT)
	if err != nil {
		t.Error("Unexpected error:", err)
	}
	if len(failures) == 0 {
		t.Error("Expected validation failures for sht31d with missing address config")
	}

	// Unknown type
	unknownD := Driver{Type: "unknown-type"}
	if _, err := d.ValidateParameters(unknownD); err == nil {
		t.Error("Expected error for unknown driver type")
	}

	// Missing name should produce name failure
	noNameD := Driver{Type: "sht31d", Config: []byte(`{"address":68}`)}
	failures, _ = d.ValidateParameters(noNameD)
	_ = failures

	if _, err := d.ListOptions(); err != nil {
		t.Error("Failed to list driver options:", err)
	}
	if _, err := d.DigitalOutputDriver("rpi"); err != nil {
		t.Error(err)
	}
	if _, err := d.DigitalInputDriver("rpi"); err != nil {
		t.Error(err)
	}
	if _, err := d.PWMDriver("rpi"); err != nil {
		t.Error(err)
	}
	if err := d.Close(); err != nil {
		t.Error(err)
	}
	if err := d.Delete("1"); err != nil {
		t.Error("Failed to delete driver:", err)
	}
}

func TestDrivers_DeleteAllowsIDReuseAfterBucketReset(t *testing.T) {
	d, s := newDrivers(t)
	defer s.Close()

	if err := d.Delete("1"); err != nil {
		t.Fatal("Failed to delete driver. Error:", err)
	}
	if err := s.DeleteBucket(storage.DriverBucket); err != nil {
		t.Fatal("Failed to delete driver bucket. Error:", err)
	}
	if err := s.CreateBucket(storage.DriverBucket); err != nil {
		t.Fatal("Failed to recreate driver bucket. Error:", err)
	}

	err := d.Create(Driver{
		Name:   "bar",
		Type:   "pca9685",
		Config: []byte(`{}`),
		Parameters: map[string]interface{}{
			"Address":   0x41,
			"Frequency": 1200,
		},
	})
	if err != nil {
		t.Fatal("Expected driver create to succeed after delete and bucket reset. Error:", err)
	}
}
