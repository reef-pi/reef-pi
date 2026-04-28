package esphome

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/reef-pi/hal"
)

func TestFactory_Metadata(t *testing.T) {
	f := Factory()
	m := f.Metadata()
	if m.Name != "ESPHome" {
		t.Errorf("expected name ESPHome, got %q", m.Name)
	}
	if len(m.Capabilities) == 0 {
		t.Error("expected at least one capability")
	}
	if params := f.GetParameters(); len(params) != 3 {
		t.Fatalf("expected three config parameters, got %d", len(params))
	}
}

func TestFactory_ValidateParameters(t *testing.T) {
	f := Factory()

	valid, _ := f.ValidateParameters(map[string]interface{}{
		paramAddress:    "192.168.1.50",
		paramEntityID:   "light",
		paramEntityType: entityTypeSwitch,
	})
	if !valid {
		t.Error("expected valid parameters")
	}

	valid, failures := f.ValidateParameters(map[string]interface{}{})
	if valid {
		t.Error("expected invalid parameters when address is missing")
	}
	if len(failures) == 0 {
		t.Error("expected failure messages")
	}

	valid, failures = f.ValidateParameters(map[string]interface{}{
		paramAddress:    "192.168.1.50",
		paramEntityID:   "light",
		paramEntityType: "invalid",
	})
	if valid {
		t.Error("expected invalid entity type to fail")
	}
	if _, ok := failures[paramEntityType]; !ok {
		t.Error("expected EntityType failure")
	}
}

func TestSwitchPin_Write(t *testing.T) {
	var paths []string
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if !strings.Contains(r.URL.Path, "/switch/light/") {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		paths = append(paths, r.URL.Path)
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	// Point httpClient at the test server by overriding the address.
	address := strings.TrimPrefix(srv.URL, "http://")
	p := &switchPin{address: address, entityID: "light"}

	if err := p.Write(true); err != nil {
		t.Errorf("Write(true) unexpected error: %v", err)
	}
	if err := p.Write(false); err != nil {
		t.Errorf("Write(false) unexpected error: %v", err)
	}
	if strings.Join(paths, "\n") != "/switch/light/turn_on\n/switch/light/turn_off" {
		t.Fatalf("unexpected switch paths: %v", paths)
	}
	if p.Name() != "light" || p.Number() != 0 {
		t.Fatalf("unexpected switch pin identity: %s %d", p.Name(), p.Number())
	}
	if err := p.Close(); err != nil {
		t.Fatalf("switch Close() error: %v", err)
	}
}

func TestSwitchPin_WriteHTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "nope", http.StatusTeapot)
	}))
	defer srv.Close()

	address := strings.TrimPrefix(srv.URL, "http://")
	p := &switchPin{address: address, entityID: "light"}

	if err := p.Write(true); err == nil {
		t.Fatal("expected non-200 response to fail")
	}
}

func TestSwitchPin_LastState(t *testing.T) {
	entities := []entityState{{ID: "switch-light", State: "ON", Value: 0}}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(entities)
	}))
	defer srv.Close()

	address := strings.TrimPrefix(srv.URL, "http://")
	p := &switchPin{address: address, entityID: "light"}
	if !p.LastState() {
		t.Error("expected LastState to be true")
	}
}

func TestSwitchPin_LastStateErrorsReturnFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`not-json`))
	}))
	defer srv.Close()

	address := strings.TrimPrefix(srv.URL, "http://")
	p := &switchPin{address: address, entityID: "light"}
	if p.LastState() {
		t.Fatal("expected invalid response to return false")
	}
}

func TestSensorPin_Value(t *testing.T) {
	entities := []entityState{{ID: "sensor-temp", State: "", Value: 23.5}}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(entities)
	}))
	defer srv.Close()

	address := strings.TrimPrefix(srv.URL, "http://")
	s := &sensorPin{address: address, entityID: "temp"}
	v, err := s.Value()
	if err != nil {
		t.Fatalf("Value() error: %v", err)
	}
	if v != 23.5 {
		t.Errorf("expected 23.5, got %f", v)
	}
	if s.Name() != "temp" || s.Number() != 0 {
		t.Fatalf("unexpected sensor pin identity: %s %d", s.Name(), s.Number())
	}
	if err := s.Close(); err != nil {
		t.Fatalf("sensor Close() error: %v", err)
	}
}

func TestSensorPin_Measure(t *testing.T) {
	entities := []entityState{{ID: "temp", State: "", Value: 23.5}}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(entities)
	}))
	defer srv.Close()

	address := strings.TrimPrefix(srv.URL, "http://")
	s := &sensorPin{address: address, entityID: "temp"}

	raw, err := s.Measure()
	if err != nil {
		t.Fatalf("Measure() raw error: %v", err)
	}
	if raw != 23.5 {
		t.Fatalf("expected raw measure 23.5, got %f", raw)
	}
	if err := s.Calibrate([]hal.Measurement{{Expected: 25, Observed: 23.5}}); err != nil {
		t.Fatalf("Calibrate() error: %v", err)
	}
	calibrated, err := s.Measure()
	if err != nil {
		t.Fatalf("Measure() calibrated error: %v", err)
	}
	if calibrated != 25 {
		t.Fatalf("expected calibrated measure 25, got %f", calibrated)
	}
	if err := s.Calibrate([]hal.Measurement{{}, {}, {}}); err != nil {
		t.Fatalf("Calibrate() stores invalid calibration for Measure: %v", err)
	}
	if _, err := s.Measure(); err == nil {
		t.Fatal("expected invalid calibration to fail during Measure")
	}
}

func TestFetchEntityStateErrors(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode([]entityState{{ID: "other", Value: 1}})
	}))
	defer srv.Close()

	address := strings.TrimPrefix(srv.URL, "http://")
	if _, err := fetchEntityState(address, "missing"); err == nil {
		t.Fatal("expected missing entity to fail")
	}
}

func TestNewDriver_Switch(t *testing.T) {
	f := Factory()
	halDriver, err := f.NewDriver(map[string]interface{}{
		paramAddress:    "192.168.1.50",
		paramEntityID:   "light",
		paramEntityType: entityTypeSwitch,
	}, nil)
	if err != nil {
		t.Fatalf("NewDriver error: %v", err)
	}
	d := halDriver.(*driver)
	if d.Metadata().Name != "ESPHome" {
		t.Fatalf("unexpected metadata name: %s", d.Metadata().Name)
	}
	pins, err := d.Pins(hal.DigitalOutput)
	if err != nil {
		t.Fatalf("DigitalOutput Pins() error: %v", err)
	}
	if len(pins) != 1 {
		t.Fatalf("expected one digital output pin, got %d", len(pins))
	}
	if _, err := d.Pins(hal.AnalogInput); err == nil {
		t.Fatal("expected analog pins on switch driver to fail")
	}
	if _, err := d.Pins(hal.PWM); err == nil {
		t.Fatal("expected unsupported capability to fail")
	}
	if len(d.DigitalOutputPins()) != 1 {
		t.Fatal("expected one digital output pin")
	}
	if _, err := d.DigitalOutputPin(0); err != nil {
		t.Fatalf("DigitalOutputPin(0) error: %v", err)
	}
	if _, err := d.DigitalOutputPin(1); err == nil {
		t.Fatal("expected invalid digital pin to fail")
	}
	if d.AnalogInputPins() != nil {
		t.Fatal("expected no analog pins on switch driver")
	}
	if err := d.Close(); err != nil {
		t.Errorf("Close() error: %v", err)
	}
}

func TestNewDriver_Sensor(t *testing.T) {
	f := Factory()
	halDriver, err := f.NewDriver(map[string]interface{}{
		paramAddress:    "192.168.1.50",
		paramEntityID:   "temperature",
		paramEntityType: entityTypeSensor,
	}, nil)
	if err != nil {
		t.Fatalf("NewDriver error: %v", err)
	}
	d := halDriver.(*driver)
	pins, err := d.Pins(hal.AnalogInput)
	if err != nil {
		t.Fatalf("AnalogInput Pins() error: %v", err)
	}
	if len(pins) != 1 {
		t.Fatalf("expected one analog input pin, got %d", len(pins))
	}
	if _, err := d.Pins(hal.DigitalOutput); err == nil {
		t.Fatal("expected digital output pins on sensor driver to fail")
	}
	if len(d.AnalogInputPins()) != 1 {
		t.Fatal("expected one analog input pin")
	}
	if _, err := d.AnalogInputPin(0); err != nil {
		t.Fatalf("AnalogInputPin(0) error: %v", err)
	}
	if _, err := d.AnalogInputPin(1); err == nil {
		t.Fatal("expected invalid analog pin to fail")
	}
	if d.DigitalOutputPins() != nil {
		t.Fatal("expected no digital output pins on sensor driver")
	}
	if err := d.Close(); err != nil {
		t.Errorf("Close() error: %v", err)
	}
}

func TestNewDriver_MissingParams(t *testing.T) {
	f := Factory()
	_, err := f.NewDriver(map[string]interface{}{}, nil)
	if err == nil {
		t.Error("expected error for missing parameters")
	}
}
