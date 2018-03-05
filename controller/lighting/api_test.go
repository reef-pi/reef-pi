package lighting

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"strings"
	"testing"
	"time"
)

func TestLightingAPI(t *testing.T) {

	rpi := utils.NewRPIPWMDriver()
	conf := utils.DefaultPWMConfig
	conf.DevMode = true
	pca9685, err := utils.NewPWM(i2c.MockBus(), conf)
	if err != nil {
		t.Error(err)
	}

	config := DefaultConfig
	config.DevMode = true
	config.Interval = 1 * time.Second
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	jacks := connectors.NewJacks(store, rpi, pca9685)
	if err := jacks.Setup(); err != nil {
		t.Fatal(err)
	}
	c, err := New(config, jacks, store, i2c.MockBus(), telemetry)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup lighting controller")
	}
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	c.Start()
	time.Sleep(2 * time.Second)
	c.Stop()
	j1 := connectors.Jack{
		Name:   "J1",
		Pins:   []int{3},
		Driver: "pca9685",
	}
	if err := c.jacks.Create(j1); err != nil {
		t.Fatal(err)
	}
	jacksList, err := c.jacks.List()
	if err != nil {
		t.Fatal(err)
	}

	l := Light{
		Jack: jacksList[0].ID,
		Name: "Foo",
	}
	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	enc.Encode(l)
	if err := tr.Do("PUT", "/api/lights", body, nil); err != nil {
		t.Fatal("Failed to create light using api")
	}
	var lights []Light
	if err := tr.Do("GET", "/api/lights", strings.NewReader("{}"), &lights); err != nil {
		t.Fatal("Failed to light using api")
	}
}
