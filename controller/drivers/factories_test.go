package drivers

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestFactory(t *testing.T) {
	store, err := storage.TestDB()
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}
	mgr := TestDrivers(store)
	providers := []string{
		"rpi",
		"pca9685",
		"ph-board",
		"pico-board",
		"ph-ezo",
		"hs103",
		"hs110",
		"hs300",
        "tasmota-http",
	}
	for _, p := range providers {
		_, err := AbstractFactory(p)
		if err != nil {
			t.Error(err)
		}
	}
	d := Driver{
		Name:   "foo",
		Type:   "ph-board",
		Config: []byte(`{"address":64}`),
	}
	if err := mgr.Create(d); err != nil {
		t.Error(err)
	}

	d.Config = nil
	d.Parameters = map[string]interface{}{
		"Address": 64,
	}
	if _, err := AbstractFactory("foo"); err == nil {
		t.Error("Expected error")
	}

	if err := mgr.Create(d); err != nil {
		t.Error(err)
	}
	if _, err := mgr.Get("1"); err != nil {
		t.Error(err)
	}

	if _, err := mgr.AnalogInputDriver("1"); err != nil {
		t.Error(err)
	}
}
