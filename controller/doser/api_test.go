package doser

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"testing"
)

func TestATOAPI(t *testing.T) {
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	rpi := utils.NewRPIPWMDriver(100, true)
	conf := utils.DefaultPWMConfig
	conf.DevMode = true
	pca9685, err := utils.NewPWM(i2c.MockBus(), conf)
	if err != nil {
		t.Error(err)
	}
	jacks := connectors.NewJacks(store, rpi, pca9685)
	jacks.Setup()
	j := connectors.Jack{
		Name:   "Foo",
		Pins:   []int{1},
		Driver: "pca9685",
	}
	jacks.Create(j)
	c, err := New(true, store, jacks, telemetry)
	if err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.LoadAPI(tr.Router)
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(&Pump{Name: "Foo", Pin: 0, Jack: "1"})
	if err := tr.Do("PUT", "/api/doser/pumps", body, nil); err != nil {
		t.Fatal("Failed to create dosing pump using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/doser/pumps/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete get pump using api. Error:", err)
	}
	c.Start()
	body.Reset()
	json.NewEncoder(body).Encode(&DosingRegiment{
		Schedule: Schedule{
			Hour:   "*",
			Minute: "*",
			Day:    "*",
			Second: "0",
		},
		Enable: true,
	})
	if err := tr.Do("POST", "/api/doser/pumps/1/schedule", body, nil); err != nil {
		t.Fatal("Failed to schedule dosing pump using api. Error:", err)
	}
	body.Reset()
	json.NewEncoder(body).Encode(&CalibrationDetails{})
	if err := tr.Do("POST", "/api/doser/pumps/1/calibrate", body, nil); err != nil {
		t.Fatal("Failed to calibrate dosing pump using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/doser/pumps", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to list dosing pumps using api. Error:", err)
	}
	body.Reset()
	json.NewEncoder(body).Encode(&Pump{Name: "Foo", Pin: 1})
	if err := tr.Do("POST", "/api/doser/pumps/1", body, nil); err != nil {
		t.Fatal("Failed to update dosing pump using api. Error:", err)
	}
	if err := tr.Do("DELETE", "/api/doser/pumps/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete dosing pump using api. Error:", err)
	}
	regimen := DosingRegiment{}
	if err := c.Schedule("1", regimen); err == nil {
		t.Errorf("Invalid dosing regimen should fail")
	}
	c.Stop()
}
