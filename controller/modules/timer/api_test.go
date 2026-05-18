package timer

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

func TestTimerController(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	defer con.Store().Close()

	o := connectors.Outlet{Name: "bar", Pin: 24, Driver: "rpi"}
	outlets := con.DM().Outlets()
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	e := equipment.New(con)
	e.Setup()
	if err := outlets.Create(o); err != nil {
		t.Fatal(err)
	}
	eq := equipment.Equipment{Name: "Foo", Outlet: "1"}
	if err := e.Create(eq); err != nil {
		t.Fatal("Failed to create equipment. Error:", err)
	}
	eqs, err := e.List()
	if err != nil {
		t.Fatal("Failed to list equipment. Error:", err)
	}

	c := New(con)
	c.Setup()
	c.Start()

	j := Job{
		Name:   "test-job",
		Target: []byte(fmt.Sprintf(`{"id":"%s", "revert":true,"on":true, "duration":1}`, eqs[0].ID)),
		Second: "0",
		Minute: "*",
		Hour:   "*",
		Day:    "*",
		Month:  "*",
		Week:   "?",
		Type:   "equipment",
		Enable: true,
	}

	if err := c.Create(j); err != nil {
		t.Fatal("Failed to create timer job:", err)
	}

	jobs, err := c.List()
	if err != nil {
		t.Fatal("Failed to list timer jobs:", err)
	}
	if len(jobs) != 1 {
		t.Fatalf("Expected 1 job, got %d", len(jobs))
	}

	if err := c.On("1", true); err != nil {
		t.Error(err)
	}

	j1, err := c.Get(jobs[0].ID)
	if err != nil {
		t.Fatal("Failed to get timer job:", err)
	}
	if j1.Name != "test-job" {
		t.Fatal("Expected job name 'test-job', found", j1.Name)
	}

	j1.Name = "altered"
	j1.Type = "reminder"
	j1.Enable = true
	j1.Target = json.RawMessage(`{"title":"test"}`)
	if err := c.Update(j1.ID, j1); err != nil {
		t.Fatal("Failed to update timer job:", err)
	}

	c.Stop()
	c.Start()
	c.Stop()

	if err := c.Delete(j1.ID); err != nil {
		t.Fatal("Failed to delete timer job:", err)
	}

	eq.ID = "1"
	r, err := NewSubSystemRunner(j, con)
	if err != nil {
		t.Error(err)
	}
	r.Run()

	j.Day = "X"
	if err := j.Validate(); err == nil {
		t.Error("Job validation should fail if day is set to invalid value")
	}
	j.Day = "*"
	j.Type = "reminder"
	j.Target = json.RawMessage(`{"title":""}`)
	if err := j.Validate(); err == nil {
		t.Error("Job validation should fail if reminder title is empty")
	}

	j.Type = "equipment"
	j.Target = json.RawMessage(`{"id":""}`)
	if err := j.Validate(); err == nil {
		t.Error("Job validation should fail if equipment id is empty")
	}
	j.Type = "invalid"
	if err := j.Validate(); err == nil {
		t.Error("Job validation should fail if job type is not valid")
	}
	if err := c.On("-1", false); err == nil {
		t.Error("Controlling invalid timer should fail")
	}
	if _, err := c.Runner(j); err == nil {
		t.Error("Creating runner for invalid job type should fail")
	}
}
