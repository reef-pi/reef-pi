package drivers

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"

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

	tr := utils.NewTestRouter()
	d.LoadAPI(tr.Router)
	body := new(bytes.Buffer)
	if err := tr.Do("GET", "/api/drivers", body, nil); err != nil {
		t.Error("Failed to list drivers using api. Error:", err)
	}
	json.NewEncoder(body).Encode(&Driver{
		Type: "pca9685",
		Parameters: map[string]interface{}{
			"Address":   0x40,
			"Frequency": 1200,
		},
	})
	if err := tr.Do("PUT", "/api/drivers", body, nil); err != nil {
		t.Error("Failed to create driver using api. Error:", err)
	}
	body.Reset()
	json.NewEncoder(body).Encode(&Driver{
		Type: "rpi",
	})
	if err := tr.Do("POST", "/api/drivers/1", body, nil); err != nil {
		t.Error("Failed to update driver using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/drivers/1", body, nil); err != nil {
		t.Error("Failed to fetch driver using api. Error:", err)
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
	if err := tr.Do("DELETE", "/api/drivers/1", body, nil); err != nil {
		t.Error("Failed to delete driver using api. Error:", err)
	}

	_, err := d.ListOptions()
	if err != nil {
		t.Error("Failed to list options")
	}
}
