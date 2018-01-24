package timer

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"strings"
	"testing"
)

func TestTimerController(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}

	eConfig := equipments.Config{
		DevMode: true,
	}
	o := connectors.Outlet{
		Name: "bar",
		Pin:  24,
	}
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = true
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	e := equipments.New(eConfig, outlets, store, utils.TestTelemetry())
	e.Setup()
	if err := outlets.Create(o); err != nil {
		t.Fatal(err)
	}

	eq := equipments.Equipment{
		Name:   "Foo",
		Outlet: "1",
	}

	if err := e.Create(eq); err != nil {
		t.Fatal("Failed to create equipment. Error:", err)
	}
	eqs, err := e.List()

	if err != nil {
		t.Fatal("Failed to list equipments. Error:", err)
	}
	c := New(store, utils.TestTelemetry(), e)
	c.Setup()
	c.Start()
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup equipments subsystem. Error:", err)
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
	}
	enc.Encode(&j)
	if err := tr.Do("PUT", "/api/timers", body, nil); err != nil {
		t.Fatal("Failed to create timer using api. Error:", err)
	}
	var jobs []Job
	if err := tr.Do("GET", "/api/timers", strings.NewReader("{}"), &jobs); err != nil {
		t.Fatal("Failed to list timer jobs using api")
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
	body = new(bytes.Buffer)
	json.NewEncoder(body).Encode(j1)
	if err := tr.Do("POST", "/api/timers/"+j1.ID, body, nil); err != nil {
		t.Fatal("Failed to update individual timer jobs using api")
	}
	c.Stop()
	c.Start()
	c.Stop()
	if err := tr.Do("DELETE", "/api/timers/"+j1.ID, strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to delete timer job using api. Error:", err)
	}
}
