package esphome

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
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
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("expected POST, got %s", r.Method)
		}
		if !strings.Contains(r.URL.Path, "/switch/light/") {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
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
}

func TestNewDriver_Switch(t *testing.T) {
	f := Factory()
	d, err := f.NewDriver(map[string]interface{}{
		paramAddress:    "192.168.1.50",
		paramEntityID:   "light",
		paramEntityType: entityTypeSwitch,
	}, nil)
	if err != nil {
		t.Fatalf("NewDriver error: %v", err)
	}
	pins, err := d.Pins(0) // hal.DigitalOutput == 2; use Pins directly
	_ = pins
	_ = err
	if err := d.Close(); err != nil {
		t.Errorf("Close() error: %v", err)
	}
}

func TestNewDriver_Sensor(t *testing.T) {
	f := Factory()
	d, err := f.NewDriver(map[string]interface{}{
		paramAddress:    "192.168.1.50",
		paramEntityID:   "temperature",
		paramEntityType: entityTypeSensor,
	}, nil)
	if err != nil {
		t.Fatalf("NewDriver error: %v", err)
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
