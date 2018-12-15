package timer

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/drivers"
	"github.com/reef-pi/reef-pi/controller/equipment"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestTimerController(t *testing.T) {
	con, err := utils.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}

	eConfig := equipment.Config{
		DevMode: true,
	}
	o := connectors.Outlet{
		Name: "bar",
		Pin:  24,
	}
	drvrs := drivers.TestDrivers(con.Store())
	outlets := connectors.NewOutlets(drvrs, con.Store())
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	e := equipment.New(eConfig, outlets, con.Store(), con.Telemetry())
	e.Setup()
	if err := outlets.Create(o); err != nil {
		t.Fatal(err)
	}

	eq := equipment.Equipment{
		Name:   "Foo",
		Outlet: "1",
	}

	if err := e.Create(eq); err != nil {
		t.Fatal("Failed to create equipment. Error:", err)
	}
	eqs, err := e.List()

	if err != nil {
		t.Fatal("Failed to list equipment. Error:", err)
	}
	c := New(con, e)
	c.Setup()
	c.Start()
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup equipment subsystem. Error:", err)
	}
	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	j := Job{
		Name:      "test-job",
		Equipment: UpdateEquipment{ID: eqs[0].ID},
		Second:    "0",
		Minute:    "*",
		Hour:      "*",
		Day:       "*",
		Type:      "equipment",
		Enable:    true,
	}

	enc.Encode(&j)
	if err := tr.Do("PUT", "/api/timers", body, nil); err != nil {
		t.Fatal("Failed to create timer using api. Error:", err)
	}
	var jobs []Job
	if err := tr.Do("GET", "/api/timers", strings.NewReader("{}"), &jobs); err != nil {
		t.Fatal("Failed to list timer jobs using api")
	}
	if err := c.On("1", true); err != nil {
		t.Error(err)
	}
	if len(jobs) != 1 {
		t.Fatal("Total number of jobs expected:1, found:", len(jobs))
	}
	var j1 Job
	if err := tr.Do("GET", "/api/timers/"+jobs[0].ID, strings.NewReader("{}"), &j1); err != nil {
		t.Fatal("Failed to get individual timer jobs using api")
	}
	if j1.Name != "test-job" {
		t.Fatal("Expected job name 'test-job' , found", j1.Name)
	}

	j1.Name = "altered"
	j1.Type = "reminder"
	j1.Enable = true
	body = new(bytes.Buffer)
	json.NewEncoder(body).Encode(j1)
	if err := tr.Do("POST", "/api/timers/"+j1.ID, body, nil); err != nil {
		t.Fatal("Failed to update individual timer jobs using api")
	}
	if _, err := c.IsEquipmentInUse("1"); err != nil {
		t.Error(err)
	}
	c.Stop()
	c.Start()
	c.Stop()
	if err := tr.Do("DELETE", "/api/timers/"+j1.ID, strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to delete timer job using api. Error:", err)
	}

	uq := UpdateEquipment{
		Revert:   true,
		ID:       "1",
		On:       true,
		Duration: 1,
	}
	eq.ID = "1"
	r := EquipmentRunner{
		equipment: e,
		target:    uq,
		eq:        eq,
	}
	r.Run()
	j.Day = "X"
	if err := j.Validate(); err == nil {
		t.Error("Job validation should fail if day is set to invalid value")
	}
	j.Day = "*"
	j.Type = "reminder"
	j.Reminder.Title = ""
	if err := j.Validate(); err == nil {
		t.Error("Job validation should fail if reminder title is empty")
	}

	j.Type = "equipment"
	j.Equipment.ID = ""
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
		t.Error("Creating running for invalid job type should fail")
	}
}
