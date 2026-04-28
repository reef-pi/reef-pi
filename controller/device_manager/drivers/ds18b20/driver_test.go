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
	params := f.GetParameters()
	if len(params) != 1 {
		t.Fatalf("expected one config parameter, got %d", len(params))
	}
	if params[0].Name != deviceParam {
		t.Fatalf("expected parameter %q, got %q", deviceParam, params[0].Name)
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

	ok, errs = f.ValidateParameters(map[string]interface{}{deviceParam: ""})
	if ok {
		t.Error("expected empty device to be invalid")
	}
	if len(errs[deviceParam]) == 0 {
		t.Error("expected device validation error for empty string")
	}

	ok, errs = f.ValidateParameters(map[string]interface{}{deviceParam: 28})
	if ok {
		t.Error("expected non-string device to be invalid")
	}
	if len(errs[deviceParam]) == 0 {
		t.Error("expected device validation error for non-string")
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

func TestReadTempErrors(t *testing.T) {
	tests := []struct {
		name  string
		input string
	}{
		{
			name:  "missing second line",
			input: "61 01 4b 46 7f ff 0c 10 e7 : crc=e7 YES\n",
		},
		{
			name:  "second line missing equals",
			input: "61 01 4b 46 7f ff 0c 10 e7 : crc=e7 YES\n61 01 4b 46 7f ff 0c 10 e7\n",
		},
		{
			name:  "bad number",
			input: "61 01 4b 46 7f ff 0c 10 e7 : crc=e7 YES\n61 01 4b 46 7f ff 0c 10 e7 t=nope\n",
		},
		{
			name:  "out of range high",
			input: "61 01 4b 46 7f ff 0c 10 e7 : crc=e7 YES\n61 01 4b 46 7f ff 0c 10 e7 t=126000\n",
		},
		{
			name:  "out of range low",
			input: "61 01 4b 46 7f ff 0c 10 e7 : crc=e7 YES\n61 01 4b 46 7f ff 0c 10 e7 t=-56000\n",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if _, err := readTemp(strings.NewReader(tc.input)); err == nil {
				t.Fatal("expected readTemp error")
			}
		})
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
	if d.Metadata().Name != "ds18b20" {
		t.Fatalf("unexpected metadata name: %s", d.Metadata().Name)
	}
	if _, err := d.Pins(hal.DigitalOutput); err == nil {
		t.Fatal("expected unsupported capability error")
	}
	if err := d.Close(); err != nil {
		t.Fatalf("Close() error: %v", err)
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
	if len(ad.AnalogInputPins()) != 1 {
		t.Fatal("expected one analog input pin")
	}

	_, err = ad.AnalogInputPin(1)
	if err == nil {
		t.Error("expected error for invalid pin number")
	}
}

func TestNewDriverInvalidParams(t *testing.T) {
	f := Factory()
	if _, err := f.NewDriver(map[string]interface{}{}, nil); err == nil {
		t.Fatal("expected invalid params to fail")
	}
}

func TestChannel(t *testing.T) {
	pin := newChannel("28-missing")
	ch, ok := pin.(*channel)
	if !ok {
		t.Fatal("expected *channel")
	}
	if ch.Name() != "temperature" {
		t.Fatalf("unexpected channel name: %s", ch.Name())
	}
	if ch.Number() != 0 {
		t.Fatalf("unexpected channel number: %d", ch.Number())
	}
	if err := ch.Close(); err != nil {
		t.Fatalf("Close() error: %v", err)
	}
	if err := ch.Calibrate([]hal.Measurement{{Expected: 25, Observed: 23}}); err != nil {
		t.Fatalf("Calibrate() error: %v", err)
	}
	if err := ch.Calibrate([]hal.Measurement{{}, {}, {}}); err == nil {
		t.Fatal("expected invalid calibration to fail")
	}
	if _, err := ch.Value(); err == nil {
		t.Fatal("expected Value() to fail for missing sysfs device")
	}
	if _, err := ch.Measure(); err == nil {
		t.Fatal("expected Measure() to fail for missing sysfs device")
	}
}
