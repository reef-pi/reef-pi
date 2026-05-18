package doser

import (
	"fmt"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
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
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}

	js, err := jacks.List()
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(js)

	pump := Pump{
		Name: "Foo",
		Pin:  0,
		Jack: "1",
		Regiment: DosingRegiment{
			Schedule: Schedule{"*", "*", "*", "*", "*", "*"},
		},
	}
	if err := c.Create(pump); err != nil {
		t.Fatal("Create failed:", err)
	}

	pumps, err := c.List()
	if err != nil {
		t.Fatal("List failed:", err)
	}
	if len(pumps) == 0 {
		t.Fatal("Expected at least one pump")
	}
	id := pumps[0].ID

	if _, err := c.Get(id); err != nil {
		t.Fatal("Get failed:", err)
	}

	c.SaveCalibrationResult(id, CalibrationDetails{Duration: 10, Volume: 25})

	if _, err := c.Usage(id); err != nil {
		t.Error("Usage failed:", err)
	}

	c.Start()
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
	if err := c.Schedule(id, regiment); err != nil {
		t.Fatal("Schedule failed:", err)
	}

	if err := c.Calibrate(id, CalibrationDetails{}); err != nil {
		t.Error("Calibrate:", err)
	}

	updated := pump
	updated.Name = "Bar"
	updated.Pin = 1
	if err := c.Update(id, updated); err != nil {
		t.Fatal("Update failed:", err)
	}

	if err := c.On(id, true); err != nil {
		t.Error(err)
	}

	if err := c.Delete(id); err != nil {
		t.Fatal("Delete failed:", err)
	}

	if err := c.Schedule(id, DosingRegiment{}); err == nil {
		t.Errorf("Schedule on deleted pump should fail")
	}
	c.Stop()
}
