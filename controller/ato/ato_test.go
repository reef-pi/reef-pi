package ato

import (
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/equipment"
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
	"time"
)

func TestATO(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	telemetry := utils.TestTelemetry()
	conf := equipment.Config{DevMode: true}
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipment.New(conf, outlets, store, telemetry)
	c, err := New(true, store, telemetry, eqs)

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
