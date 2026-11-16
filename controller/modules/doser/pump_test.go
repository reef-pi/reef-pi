package doser

import (
	"errors"
	"reflect"
	"strings"
	"sync"
	"testing"
	"time"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
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

func TestControllerCalibrationAndDependencyPaths(t *testing.T) {
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

	if _, err := ctrl.GetEntity("1"); err == nil {
		t.Fatal("expected GetEntity to fail")
	}
	if _, err := ctrl.InUse("unknown", "1"); err == nil || !strings.Contains(err.Error(), "unknown deptype") {
		t.Fatalf("expected unknown dependency type error, got %v", err)
	}

	p := Pump{
		Name: "pump-1",
		Pin:  1,
		Jack: "jack-1",
		Regiment: DosingRegiment{
			Schedule: Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
		},
	}
	if err := ctrl.Create(p); err != nil {
		t.Fatal(err)
	}

	deps, err := ctrl.InUse(storage.JackBucket, "jack-1")
	if err != nil {
		t.Fatal(err)
	}
	if len(deps) != 1 || deps[0] != "jack-1" {
		t.Fatalf("unexpected jack dependencies: %v", deps)
	}

	if err := ctrl.SaveCalibrationResult("1", CalibrationDetails{Duration: 0, Volume: 5}); err == nil {
		t.Fatal("expected zero calibration duration to fail")
	}
	if err := ctrl.SaveCalibrationResult("1", CalibrationDetails{Duration: 10, Volume: 0}); err == nil {
		t.Fatal("expected zero calibration volume to fail")
	}
	if err := ctrl.SaveCalibrationResult("1", CalibrationDetails{Duration: 10, Volume: 25}); err != nil {
		t.Fatal(err)
	}
	got, err := ctrl.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if got.Regiment.VolumePerSecond != 2.5 {
		t.Fatalf("expected volume per second 2.5, got %f", got.Regiment.VolumePerSecond)
	}
}

func TestControllerOnRejectsEnabledPumpBeforeControl(t *testing.T) {
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

	p := Pump{
		Name: "pump-1",
		Pin:  1,
		Jack: "missing-jack",
		Regiment: DosingRegiment{
			Enable:   true,
			Schedule: Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
		},
	}
	if err := ctrl.Create(p); err != nil {
		t.Fatal(err)
	}

	if err := ctrl.On("1", true); err == nil || !strings.Contains(err.Error(), "enabled doser") {
		t.Fatalf("expected enabled doser On error, got %v", err)
	}
}

func TestControllerStartRegistersEnabledPumps(t *testing.T) {
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
	defer ctrl.Stop()

	pumps := []Pump{
		{
			Name: "disabled",
			Jack: "missing-jack",
			Pin:  1,
			Regiment: DosingRegiment{
				Enable: false,
				Schedule: Schedule{
					Second: "0",
					Minute: "0",
					Hour:   "0",
					Day:    "1",
					Month:  "1",
					Week:   "*",
				},
			},
		},
		{
			Name: "scheduled",
			Jack: "missing-jack",
			Pin:  1,
			Regiment: DosingRegiment{
				Enable: true,
				Schedule: Schedule{
					Second: "0",
					Minute: "0",
					Hour:   "0",
					Day:    "1",
					Month:  "1",
					Week:   "*",
				},
			},
		},
		{
			Name: "continuous",
			Jack: "missing-jack",
			Pin:  1,
			Regiment: DosingRegiment{
				Enable:     true,
				Continuous: true,
				Speed:      25,
			},
		},
	}
	for _, p := range pumps {
		if err := ctrl.Create(p); err != nil {
			t.Fatal(err)
		}
	}
	ctrl.Stop()

	ctrl.cronIDs = make(map[string]cron.EntryID)
	ctrl.quitters = make(map[string]*continuousRun)
	ctrl.runner = cron.New(cron.WithParser(cron.NewParser(_cronParserSpec)))

	ctrl.Start()

	if _, ok := ctrl.cronIDs["2"]; !ok {
		t.Fatalf("expected scheduled pump to be registered in cron, got %v", ctrl.cronIDs)
	}
	if _, ok := ctrl.cronIDs["1"]; ok {
		t.Fatalf("disabled pump should not be registered in cron, got %v", ctrl.cronIDs)
	}
	if _, ok := ctrl.quitters["3"]; !ok {
		t.Fatalf("expected continuous pump quitter, got %v", ctrl.quitters)
	}
	if _, ok := ctrl.quitters["1"]; ok {
		t.Fatalf("disabled pump should not have a quitter, got %v", ctrl.quitters)
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

func TestDRV8825StepperOperationErrors(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()
	outlets := con.DM().Outlets()
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}

	d := &DRV8825{
		StepPin:       "missing-step",
		DirectionPin:  "missing-direction",
		MSPinA:        "missing-a",
		MSPinB:        "missing-b",
		MSPinC:        "missing-c",
		SPR:           200,
		VPR:           1,
		Delay:         1,
		MicroStepping: "Full",
	}

	if err := d.Microstep(outlets, true, false, true); err == nil {
		t.Fatal("expected missing microstep pins to fail")
	}
	if err := d.Step(outlets, 1); err == nil {
		t.Fatal("expected missing direction/step pins to fail")
	}
	if err := d.Dose(outlets, 1); err == nil {
		t.Fatal("expected dose with missing pins to fail")
	}
}

func TestDRV8825StepMicrosteppingModes(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	outlets := con.DM().Outlets()
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	outletPins := []struct {
		name string
		pin  int
	}{
		{name: "step", pin: 21},
		{name: "direction", pin: 22},
		{name: "micro-a", pin: 23},
		{name: "micro-b", pin: 24},
		{name: "micro-c", pin: 25},
	}
	for _, outlet := range outletPins {
		if err := outlets.Create(connectors.Outlet{Name: outlet.name, Pin: outlet.pin, Driver: "rpi"}); err != nil {
			t.Fatal(err)
		}
	}

	for _, mode := range []string{"Full", "Half", "1/4", "1/8", "1/16", "1/32", "unknown"} {
		d := &DRV8825{
			StepPin:       "1",
			DirectionPin:  "2",
			MSPinA:        "3",
			MSPinB:        "4",
			MSPinC:        "5",
			Direction:     true,
			Delay:         32,
			MicroStepping: mode,
		}
		if err := d.Step(outlets, 0); err != nil {
			t.Fatalf("Step failed for microstepping mode %q: %v", mode, err)
		}
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

func TestContinuousReplacementWaitsForOutputOff(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()
	ctrl, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	var mu sync.Mutex
	var writes []float64
	ctrl.continuousControl = func(_ string, values map[int]float64) error {
		mu.Lock()
		defer mu.Unlock()
		writes = append(writes, values[1])
		return nil
	}
	oldPump := Pump{ID: "1", Name: "old", Jack: "jack", Pin: 1, Regiment: DosingRegiment{Speed: 25}}
	newPump := Pump{ID: "1", Name: "new", Jack: "jack", Pin: 1, Regiment: DosingRegiment{Speed: 50}}
	ctrl.startContinuous(oldPump)
	waitForContinuousWrites(t, &mu, &writes, 1)
	ctrl.startContinuous(newPump)
	waitForContinuousWrites(t, &mu, &writes, 3)
	ctrl.stopContinuous("1")
	waitForContinuousWrites(t, &mu, &writes, 4)

	mu.Lock()
	defer mu.Unlock()
	want := []float64{25, 0, 50, 0}
	if !reflect.DeepEqual(writes, want) {
		t.Fatalf("continuous output writes = %v, want %v", writes, want)
	}
}

func waitForContinuousWrites(t *testing.T, mu *sync.Mutex, writes *[]float64, count int) {
	t.Helper()
	deadline := time.Now().Add(time.Second)
	for time.Now().Before(deadline) {
		mu.Lock()
		ready := len(*writes) >= count
		mu.Unlock()
		if ready {
			return
		}
		time.Sleep(time.Millisecond)
	}
	t.Fatalf("timed out waiting for %d continuous output writes", count)
}

func TestContinuousDeleteAndStopWaitForOutputOff(t *testing.T) {
	for _, action := range []string{"delete", "stop"} {
		t.Run(action, func(t *testing.T) {
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

			started := make(chan struct{})
			stopping := make(chan struct{})
			releaseStop := make(chan struct{})
			ctrl.continuousControl = func(_ string, values map[int]float64) error {
				if values[1] == 0 {
					close(stopping)
					<-releaseStop
					return errors.New("simulated output-off failure")
				}
				close(started)
				return nil
			}

			pump := Pump{
				Name: "continuous",
				Jack: "jack",
				Pin:  1,
				Regiment: DosingRegiment{
					Enable: true, Continuous: true, Speed: 40,
				},
			}
			if err := ctrl.Create(pump); err != nil {
				t.Fatal(err)
			}
			select {
			case <-started:
			case <-time.After(time.Second):
				t.Fatal("continuous pump did not start")
			}

			done := make(chan error, 1)
			go func() {
				if action == "delete" {
					done <- ctrl.Delete("1")
					return
				}
				ctrl.Stop()
				done <- nil
			}()
			select {
			case <-stopping:
			case <-time.After(time.Second):
				close(releaseStop)
				t.Fatal("lifecycle action did not request output off")
			}
			select {
			case err := <-done:
				t.Fatalf("%s returned before output-off completed: %v", action, err)
			case <-time.After(20 * time.Millisecond):
			}
			close(releaseStop)
			select {
			case err := <-done:
				if err != nil {
					t.Fatalf("%s failed after worker exited: %v", action, err)
				}
			case <-time.After(time.Second):
				t.Fatalf("%s did not return after worker exited", action)
			}
		})
	}
}
