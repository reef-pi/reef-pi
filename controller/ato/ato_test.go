package ato

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
	"time"
)

func TestATO(t *testing.T) {
	config := Config{
		DevMode:       true,
		CheckInterval: 1,
	}
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	telemetry := utils.TestTelemetry()
	c, err := New(config, store, telemetry)
	if err != nil {
		t.Error(err)
	}
	c.Start()
	time.Sleep(2 * time.Second)
	c.Stop()
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
}
