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

	rpi := utils.NewRPIPWMDriver(100, true)
	conf := utils.DefaultPCA9685Config
	conf.DevMode = true
	pca9685, err := utils.NewPCA9685(i2c.MockBus(), conf)
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
	channels := make(map[int]Channel)
	channels[1] = Channel{
		Name:  "ch1",
		Fixed: 10,
		Auto:  false,
	}
	l := Light{
		Jack:     jacksList[0].ID,
		Name:     "Foo",
		Channels: channels,
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
	body.Reset()
	if err := tr.Do("GET", "/api/lights/1", body, nil); err != nil {
		t.Fatal("get light using api")
	}
	body.Reset()
	enc.Encode(l)
	if err := tr.Do("POST", "/api/lights/1", body, nil); err != nil {
		t.Fatal("update light using api")
	}
	c.Setup()
	body.Reset()
	if err := tr.Do("DELETE", "/api/lights/1", body, nil); err != nil {
		t.Fatal("Delete light using api")
	}
	ch, _ := channels[1]
	ch.Auto = true
	ch.Values = []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}
	l.Channels[1] = ch
	c.syncLight(l)
}
