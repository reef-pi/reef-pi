package connectors

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestInletsAPI(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	drvrs := drivers.TestDrivers(store)

	tr := utils.NewTestRouter()
	i := Inlet{Name: "Foo", Pin: 21}
	inlets := NewInlets(drvrs, store)

	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}
	inlets.LoadAPI(tr.Router)
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(i)
	if err := tr.Do("PUT", "/api/inlets", body, nil); err != nil {
		t.Error(err)
	}
	body.Reset()
	i.Equipment = "1"
	json.NewEncoder(body).Encode(i)
	if err := tr.Do("POST", "/api/inlets/1", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/inlets", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("POST", "/api/inlets/1/read", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}

	body.Reset()
	i.Name = ""
	json.NewEncoder(body).Encode(i)
	if err := tr.Do("PUT", "/api/inlets", body, nil); err == nil {
		t.Error("Inlet creation expected to fail when name is not set")
	}
	body.Reset()
	i.Name = "zsd"
	i.Pin = 1
	json.NewEncoder(body).Encode(i)
	if err := tr.Do("POST", "/api/inlets/1", body, nil); err == nil {
		t.Error("Inlet update expected to fail when GPIO pin number is not valid")
	}

	if err := tr.Do("GET", "/api/inlets/1", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("DELETE", "/api/inlets/1", new(bytes.Buffer), nil); err == nil {
		t.Error("Inlet deletion expected to fail due to equipment being assigned to it")
	}
	body.Reset()
	i.Equipment = ""
	i.Pin = 16
	json.NewEncoder(body).Encode(i)
	if err := tr.Do("POST", "/api/inlets/1", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("DELETE", "/api/inlets/1", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
}
