package doser

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/drivers"
	"testing"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestDoserAPI(t *testing.T) {
	con, err := utils.TestController()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}

	drvrs := drivers.TestDrivers(con.Store())
	jacks := connectors.NewJacks(drvrs, con.Store())
	jacks.Setup()
	j := connectors.Jack{
		Name:   "Foo",
		Pins:   []int{1},
		Driver: "pca9685",
	}
	jacks.Create(j)
	c, err := New(true, con, jacks)
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
	json.NewEncoder(body).Encode(&Pump{
		Name: "Bar",
		Pin:  1,
		Regiment: DosingRegiment{
			Schedule: Schedule{
				Hour:   "*",
				Minute: "*",
				Day:    "*",
				Second: "0",
			},
		},
	})
	if err := tr.Do("POST", "/api/doser/pumps/1", body, nil); err != nil {
		t.Fatal("Failed to update dosing pump using api. Error:", err)
	}

	if err := c.On("1", true); err != nil {
		t.Error(err)
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
