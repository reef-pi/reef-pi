package ds18b20

import (
	"strings"
	"testing"

	"github.com/reef-pi/hal"
)

func TestFactory(t *testing.T) {
	f := Factory()
	meta := f.Metadata()
	if meta.Name != "ds18b20" {
		t.Errorf("expected metadata name 'ds18b20', got %q", meta.Name)
	}
	if !meta.HasCapability(hal.AnalogInput) {
		t.Error("expected AnalogInput capability")
	}
}

func TestValidateParameters(t *testing.T) {
	f := Factory()

	ok, _ := f.ValidateParameters(map[string]interface{}{deviceParam: "28-abc123"})
	if !ok {
		t.Error("expected valid parameters")
	}

	ok, errs := f.ValidateParameters(map[string]interface{}{})
	if ok {
		t.Error("expected invalid parameters when device is missing")
	}
	if len(errs) == 0 {
		t.Error("expected validation errors")
	}
}

func TestReadTemp(t *testing.T) {
	input := "61 01 4b 46 7f ff 0c 10 e7 : crc=e7 YES\n61 01 4b 46 7f ff 0c 10 e7 t=22062\n"
	v, err := readTemp(strings.NewReader(input))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if v != 22.062 {
		t.Errorf("expected 22.062, got %v", v)
	}
}

func TestReadTempCRCFail(t *testing.T) {
	input := "61 01 4b 46 7f ff 0c 10 e7 : crc=e7 NO\n61 01 4b 46 7f ff 0c 10 e7 t=22062\n"
	_, err := readTemp(strings.NewReader(input))
	if err == nil {
		t.Error("expected error when CRC check fails")
	}
}

func TestNewDriver(t *testing.T) {
	f := Factory()
	d, err := f.NewDriver(map[string]interface{}{deviceParam: "28-abc123"}, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	pins, err := d.Pins(hal.AnalogInput)
	if err != nil {
		t.Fatalf("unexpected error getting pins: %v", err)
	}
	if len(pins) != 1 {
		t.Errorf("expected 1 pin, got %d", len(pins))
	}

	ad, ok := d.(hal.AnalogInputDriver)
	if !ok {
		t.Fatal("driver does not implement AnalogInputDriver")
	}
	pin, err := ad.AnalogInputPin(0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if pin.Name() != "temperature" {
		t.Errorf("expected pin name 'temperature', got %q", pin.Name())
	}
	if pin.Number() != 0 {
		t.Errorf("expected pin number 0, got %d", pin.Number())
	}

	_, err = ad.AnalogInputPin(1)
	if err == nil {
		t.Error("expected error for invalid pin number")
	}
}
