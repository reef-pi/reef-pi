package doser

import (
	"bytes"
	"encoding/json"
	"fmt"
	"testing"

	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestDoserAPI(t *testing.T) {
	t.Parallel()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}

	d1 := drivers.Driver{
		Name:   "lighting",
		Type:   "pca9685",
		Config: []byte(`{"address":64, "frequency":1000}`),
	}
	if err := con.DM().Drivers().Create(d1); err != nil {
		t.Fatal(err)
	}
	jacks := con.DM().Jacks()
	if err := jacks.Setup(); err != nil {
		t.Fatal(err)
	}
	j := connectors.Jack{
		Name:   "Foo",
		Pins:   []int{1},
		Driver: "1",
	}
	if err := jacks.Create(j); err != nil {
		t.Fatal(err)
	}
	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()
	if err := c.Setup(); err != nil {
		t.Error(err)
	}
	c.LoadAPI(tr.Router)
	body := new(bytes.Buffer)

	js, err := jacks.List()
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(js)
	json.NewEncoder(body).Encode(&Pump{
		Name: "Foo",
		Pin:  0,
		Jack: "1",
		Regiment: DosingRegiment{
			Schedule: Schedule{"*", "*", "*", "*", "*", "*"},
		},
	})
	if err := tr.Do("PUT", "/api/doser/pumps", body, nil); err != nil {
		t.Fatal("Failed to create dosing pump using api. Error:", err)
	}
	if err := tr.Do("GET", "/api/doser/pumps/1", new(bytes.Buffer), nil); err != nil {
		t.Fatal("Failed to delete get pump using api. Error:", err)
	}
	c.Start()
	body.Reset()
	regiment := DosingRegiment{
		Schedule: Schedule{
			Hour:   "*",
			Minute: "*",
			Day:    "*",
			Second: "0",
			Month:  "*",
			Week:   "?",
		},
		Enable: true,
	}
	json.NewEncoder(body).Encode(&regiment)
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
		Jack: "1",
		Regiment: DosingRegiment{
			Schedule: Schedule{
				Hour:   "*",
				Minute: "*",
				Day:    "*",
				Second: "0",
				Month:  "*",
				Week:   "?",
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
