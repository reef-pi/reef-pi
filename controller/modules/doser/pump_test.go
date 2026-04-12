package doser

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
)

func TestPumpIsValid(t *testing.T) {
	t.Parallel()

	// empty name
	p := Pump{}
	if err := p.IsValid(); err == nil {
		t.Error("expected error for empty name")
	}

	// default type: jack missing
	p = Pump{Name: "P1", Jack: "", Regiment: DosingRegiment{
		Schedule: Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
	}}
	if err := p.IsValid(); err == nil {
		t.Error("expected error for missing jack")
	}

	// default type: negative duration
	p = Pump{Name: "P1", Jack: "1", Regiment: DosingRegiment{
		Duration: -1,
		Schedule: Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
	}}
	if err := p.IsValid(); err == nil {
		t.Error("expected error for negative duration")
	}

	// valid default pump
	p = Pump{Name: "P1", Jack: "1", Regiment: DosingRegiment{
		Schedule: Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
	}}
	if err := p.IsValid(); err != nil {
		t.Error("expected valid pump, got:", err)
	}

	// stepper type: zero volume
	p = Pump{Name: "P2", Type: "stepper", Regiment: DosingRegiment{Volume: 0}}
	if err := p.IsValid(); err == nil {
		t.Error("expected error for stepper with zero volume")
	}

	// stepper type: nil stepper config
	p = Pump{Name: "P2", Type: "stepper", Regiment: DosingRegiment{Volume: 5}}
	if err := p.IsValid(); err == nil {
		t.Error("expected error for stepper with nil stepper config")
	}

	// stepper type: stepper with invalid config (missing step pin)
	p = Pump{Name: "P2", Type: "stepper", Regiment: DosingRegiment{Volume: 5}, Stepper: &DRV8825{}}
	if err := p.IsValid(); err == nil {
		t.Error("expected error for stepper with invalid stepper config")
	}
}

func TestDRV8825IsValid(t *testing.T) {
	t.Parallel()

	d := &DRV8825{}
	if err := d.IsValid(); err == nil {
		t.Error("expected error for missing step pin")
	}

	d.StepPin = "p1"
	if err := d.IsValid(); err == nil {
		t.Error("expected error for missing direction pin")
	}

	d.DirectionPin = "p2"
	if err := d.IsValid(); err == nil {
		t.Error("expected error for zero SPR")
	}

	d.SPR = 200
	if err := d.IsValid(); err == nil {
		t.Error("expected error for zero VPR")
	}

	d.VPR = 1.0
	if err := d.IsValid(); err == nil {
		t.Error("expected error for missing MSPinA")
	}

	d.MSPinA = "pa"
	if err := d.IsValid(); err == nil {
		t.Error("expected error for missing MSPinB")
	}

	d.MSPinB = "pb"
	if err := d.IsValid(); err == nil {
		t.Error("expected error for missing MSPinC")
	}

	d.MSPinC = "pc"
	if err := d.IsValid(); err == nil {
		t.Error("expected error for zero delay")
	}

	d.Delay = 20800000
	if err := d.IsValid(); err != nil {
		t.Error("expected valid DRV8825, got:", err)
	}
}

func TestScheduleContinuousDoesNotAddCronEntry(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	ctrl, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := ctrl.Setup(); err != nil {
		t.Fatal(err)
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
		Name:   "Continuous",
		Pins:   []int{1},
		Driver: "1",
	}
	if err := jacks.Create(j); err != nil {
		t.Fatal(err)
	}

	p := Pump{
		Name: "pump-1",
		Pin:  1,
		Jack: "1",
		Regiment: DosingRegiment{
			Enable: false,
			Speed:  50,
			Schedule: Schedule{
				Second: "0",
				Minute: "*",
				Hour:   "*",
				Day:    "*",
				Month:  "*",
				Week:   "*",
			},
		},
	}
	if err := ctrl.Create(p); err != nil {
		t.Fatal(err)
	}

	regiment := DosingRegiment{
		Enable:     true,
		Continuous: true,
		Speed:      50,
	}
	if err := ctrl.Schedule("1", regiment); err != nil {
		t.Fatalf("Schedule() failed for continuous pump: %v", err)
	}

	if _, ok := ctrl.cronIDs["1"]; ok {
		t.Fatal("continuous pump should not create a cron entry")
	}
	if _, ok := ctrl.quitters["1"]; !ok {
		t.Fatal("continuous pump should register a stopper channel")
	}

	ctrl.stopContinuous("1")
}
