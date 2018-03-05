package ph

import (
	//	"bytes"
	//	"encoding/json"
	//	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"testing"
)

func TestPhAPI(t *testing.T) {
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	conf := Config{DevMode: true}
	c := New(conf, i2c.MockBus(), store, telemetry)
	tr := utils.NewTestRouter()
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.Start()
	c.LoadAPI(tr.Router)
	c.Stop()
}
