package connectors

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestOutletsAPI(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()
	o := Outlet{Name: "Foo", Pin: 1}
	outlets := NewOutlets(store)
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	outlets.LoadAPI(tr.Router)
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(o)
	if err := tr.Do("PUT", "/api/outlets", body, nil); err != nil {
		t.Error(err)
	}
	body.Reset()
	json.NewEncoder(body).Encode(o)
	if err := tr.Do("POST", "/api/outlets/1", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/outlets/1", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/outlets", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
	if err := outlets.Configure("1", false); err != nil {
		t.Error(err)
	}
	if err := tr.Do("DELETE", "/api/outlets/1", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
}
