package connectors

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"testing"
)

func TestJacksAPI(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()
	rpi := utils.NewRPIPWMDriver()
	conf := utils.DefaultPWMConfig
	conf.DevMode = true
	pca9685, err := utils.NewPWM(i2c.MockBus(), conf)
	if err != nil {
		t.Error(err)
	}
	j := Jack{Name: "Foo", Pins: []int{1}}
	jacks := NewJacks(store, rpi, pca9685)
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
	json.NewEncoder(body).Encode(j)
	if err := tr.Do("POST", "/api/jacks/1", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/jacks/1", body, nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/jacks", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
	if err := tr.Do("DELETE", "/api/jacks/1", new(bytes.Buffer), nil); err != nil {
		t.Error(err)
	}
}
