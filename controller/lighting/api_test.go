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

	d, err := json.Marshal(&FixedConfig{Value: 10})

	if err != nil {
		t.Fatal(err)
	}
	channels[1] = Channel{
		Name: "ch1",
		Min:  12,
		Profile: Profile{
			Type:   "fixed",
			Config: d,
		},
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
	ch, _ := channels[1]
	ch.Profile.Type = "auto"
	a, err := json.Marshal(&AutoConfig{
		Values: []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12},
	})

	if err != nil {
		t.Fatal(err)
	}
	ch.Profile.Config = a
	ch.Profile.Type = "auto"
	ch.Reverse = true
	l.Channels[1] = ch
	c.syncLights()
	c.UpdateChannel("1", ch, 10)
	if err := c.On("1", true); err == nil {
		t.Error("On api is not implemented yet")
	}
	c.StopCycle()
	if err := tr.Do("DELETE", "/api/lights/1", body, nil); err != nil {
		t.Fatal("Delete light using api")
	}

	l.Name = ""
	if err := c.Create(l); err == nil {
		t.Error("Light with empty name should be failed to create")
	}
	l.Name = "xxx"
	l.Jack = ""
	if err := c.Create(l); err == nil {
		t.Error("Light with empty jack should be failed to create")
	}
	l.Jack = "1"
	l.Channels = nil
	if err := c.Create(l); err != nil {
		t.Error("Light with empty channels should be allowed to create")
	}
	ch.Min = 2
	ch.Max = 8
	channels[1] = ch
	l.Channels = channels
	c.syncLight(l)
}
