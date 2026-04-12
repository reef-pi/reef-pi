package doser

import (
	"reflect"
	"testing"
	"time"
)

func TestPumpIsValidRejectsNegativeSoftStart(t *testing.T) {
	t.Parallel()

	p := Pump{
		Name: "dc-pump",
		Jack: "1",
		Pin:  0,
		Regiment: DosingRegiment{
			SoftStart: -1,
			Schedule:  Schedule{Second: "0", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
		},
	}

	if err := p.IsValid(); err == nil {
		t.Fatal("expected negative soft start to fail validation")
	}
}

func TestRunnerPWMDoseWithoutSoftStart(t *testing.T) {
	r := &Runner{
		pump: &Pump{
			Jack: "jack-1",
			Pin:  3,
			Regiment: DosingRegiment{
				SoftStart: 0,
			},
		},
		sleep: func(time.Duration) {},
	}

	var got []float64
	r.control = func(_ string, values map[int]float64) error {
		got = append(got, values[r.pump.Pin])
		return nil
	}

	if err := r.PWMDose(80, 10); err != nil {
		t.Fatalf("PWMDose failed: %v", err)
	}

	want := []float64{80, 0}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected PWM sequence: got %v want %v", got, want)
	}
}

func TestRunnerPWMDoseWithSoftStart(t *testing.T) {
	r := &Runner{
		pump: &Pump{
			Jack: "jack-1",
			Pin:  3,
			Regiment: DosingRegiment{
				SoftStart: 2,
			},
		},
		sleep: func(time.Duration) {},
	}

	var got []float64
	r.control = func(_ string, values map[int]float64) error {
		got = append(got, values[r.pump.Pin])
		return nil
	}

	if err := r.PWMDose(80, 10); err != nil {
		t.Fatalf("PWMDose failed: %v", err)
	}

	want := []float64{
		8, 16, 24, 32, 40, 48, 56, 64, 72, 80,
		72, 64, 56, 48, 40, 32, 24, 16, 8, 0,
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected PWM ramp sequence: got %v want %v", got, want)
	}
}
