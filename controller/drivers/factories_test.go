package drivers

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestFactory(t *testing.T) {
	store, err := storage.TestDB()
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
	}
	for _, p := range providers {
		_, err := AbstractFactory(p, true)
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
}
