package connectors

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/drivers"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestJacksAPI(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()

	if err != nil {
		t.Error(err)
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
	jacks.LoadAPI(tr.Router)
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("PUT", "/api/jacks", body, nil); err != nil {
		t.Error(err)
	}

	body.Reset()
	j.Driver = "1"
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("POST", "/api/jacks/1", body, nil); err != nil {
		t.Error(err)
	}

	body.Reset()
	j.Name = ""
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("PUT", "/api/jacks", body, nil); err == nil {
		t.Error("Jack creation expected to fail when jack name is absent")
	}
	body.Reset()
	j.Name = "zd"
	j.Pins = []int{}
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("PUT", "/api/jacks", body, nil); err == nil {
		t.Error("Jack creation expected to fail when jack pins are empty")
	}
	body.Reset()
	j.Pins = []int{16}
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("PUT", "/api/jacks", body, nil); err == nil {
		t.Error("Jack creation expected to fail when pca9685 pin is invalid (not 0-14)")
	}
	body.Reset()
	j.Driver = "rpi"
	j.Pins = []int{3}
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("PUT", "/api/jacks", body, nil); err == nil {
		t.Error("Jack creation expected to fail when rpi pin is invalid (not 0 or 1)")
	}
	body.Reset()
	j.Driver = ""
	j.Pins = []int{0}
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("POST", "/api/jacks/1", body, nil); err == nil {
		t.Error("Jack updateexpected to fail when driver is invalid (rpi and pca9685 are only valid values)")
	}

	if err := tr.Do("GET", "/api/jacks/1", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/jacks", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
	pinValues := make(map[int]float64)
	pinValues[0] = 73
	body.Reset()
	json.NewEncoder(body).Encode(pinValues)
	if err := tr.Do("POST", "/api/jacks/1/control", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("DELETE", "/api/jacks/1", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
}
