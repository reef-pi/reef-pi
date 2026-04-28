package wled

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/reef-pi/hal"
)

func TestFactory_metadata(t *testing.T) {
	f := Factory()
	meta := f.Metadata()
	if meta.Name != "WLED" {
		t.Errorf("Name = %q, want WLED", meta.Name)
	}
	caps := meta.Capabilities
	hasDO, hasPWM := false, false
	for _, c := range caps {
		if c == hal.DigitalOutput {
			hasDO = true
		}
		if c == hal.PWM {
			hasPWM = true
		}
	}
	if !hasDO {
		t.Error("expected DigitalOutput capability")
	}
	if !hasPWM {
		t.Error("expected PWM capability")
	}
	params := f.GetParameters()
	if len(params) != 1 {
		t.Fatalf("expected one config parameter, got %d", len(params))
	}
	if params[0].Name != paramAddress {
		t.Fatalf("expected parameter %q, got %q", paramAddress, params[0].Name)
	}
}

func TestFactory_validateParameters(t *testing.T) {
	f := Factory()
	ok, _ := f.ValidateParameters(map[string]interface{}{
		paramAddress: "192.168.1.1",
	})
	if !ok {
		t.Error("expected valid parameters")
	}

	ok, failures := f.ValidateParameters(map[string]interface{}{})
	if ok {
		t.Error("expected validation failure for missing address")
	}
	if len(failures[paramAddress]) == 0 {
		t.Error("expected address failure")
	}
}

func TestFactory_newDriver(t *testing.T) {
	f := Factory()
	halDriver, err := f.NewDriver(map[string]interface{}{paramAddress: "192.168.1.1"}, nil)
	if err != nil {
		t.Fatal(err)
	}
	d := halDriver.(*driver)
	if d.Metadata().Name != "WLED" {
		t.Fatalf("unexpected metadata name: %s", d.Metadata().Name)
	}
	if err := d.Close(); err != nil {
		t.Fatalf("Close() error: %v", err)
	}
	pins, err := d.Pins(hal.DigitalOutput)
	if err != nil {
		t.Fatalf("Pins(DigitalOutput) error: %v", err)
	}
	if len(pins) != 1 {
		t.Fatalf("expected one digital output pin, got %d", len(pins))
	}
	pins, err = d.Pins(hal.PWM)
	if err != nil {
		t.Fatalf("Pins(PWM) error: %v", err)
	}
	if len(pins) != 1 {
		t.Fatalf("expected one PWM pin, got %d", len(pins))
	}
	if _, err := d.Pins(hal.AnalogInput); err == nil {
		t.Fatal("expected unsupported capability error")
	}
	outputPins := halDriver.(hal.DigitalOutputDriver).DigitalOutputPins()
	if len(outputPins) != 1 {
		t.Fatalf("expected 1 digital output pin, got %d", len(outputPins))
	}
	if _, err := d.DigitalOutputPin(0); err != nil {
		t.Fatalf("DigitalOutputPin(0) error: %v", err)
	}
	if _, err := d.DigitalOutputPin(1); err == nil {
		t.Fatal("expected invalid digital pin error")
	}
	channels := halDriver.(hal.PWMDriver).PWMChannels()
	if len(channels) != 1 {
		t.Fatalf("expected 1 PWM channel, got %d", len(channels))
	}
	if _, err := d.PWMChannel(0); err != nil {
		t.Fatalf("PWMChannel(0) error: %v", err)
	}
	if _, err := d.PWMChannel(1); err == nil {
		t.Fatal("expected invalid PWM channel error")
	}
}

func TestFactory_newDriverInvalidParams(t *testing.T) {
	f := Factory()
	if _, err := f.NewDriver(map[string]interface{}{}, nil); err == nil {
		t.Fatal("expected invalid params to fail")
	}
}

func newTestServer(t *testing.T, state *wledState) (*httptest.Server, string) {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			json.NewEncoder(w).Encode(state)
		} else if r.Method == http.MethodPost {
			var patch wledState
			json.NewDecoder(r.Body).Decode(&patch)
			state.On = patch.On
			if patch.Bri > 0 {
				state.Bri = patch.Bri
			}
			json.NewEncoder(w).Encode(map[string]bool{"success": true})
		}
	}))
	addr := strings.TrimPrefix(srv.URL, "http://")
	return srv, addr
}

func TestWledChannel_Write_on(t *testing.T) {
	state := &wledState{On: false, Bri: 128}
	srv, addr := newTestServer(t, state)
	defer srv.Close()

	ch := &wledChannel{address: addr}
	if ch.Name() != "wled" {
		t.Fatalf("unexpected channel name: %s", ch.Name())
	}
	if ch.Number() != 0 {
		t.Fatalf("unexpected channel number: %d", ch.Number())
	}
	if err := ch.Close(); err != nil {
		t.Fatalf("Close() error: %v", err)
	}
	if err := ch.Write(true); err != nil {
		t.Fatal(err)
	}
	if !state.On {
		t.Error("expected device to be on")
	}
}

func TestWledChannel_Write_off(t *testing.T) {
	state := &wledState{On: true, Bri: 200}
	srv, addr := newTestServer(t, state)
	defer srv.Close()

	ch := &wledChannel{address: addr}
	if err := ch.Write(false); err != nil {
		t.Fatal(err)
	}
	if state.On {
		t.Error("expected device to be off")
	}
}

func TestWledChannel_LastState(t *testing.T) {
	state := &wledState{On: true, Bri: 128}
	srv, addr := newTestServer(t, state)
	defer srv.Close()

	ch := &wledChannel{address: addr}
	if !ch.LastState() {
		t.Error("expected LastState() = true")
	}
}

func TestWledChannel_LastStateErrorsReturnFalse(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`not-json`))
	}))
	defer srv.Close()

	ch := &wledChannel{address: strings.TrimPrefix(srv.URL, "http://")}
	if ch.LastState() {
		t.Fatal("expected LastState false for invalid state response")
	}
}

func TestWledChannel_setStateHTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "bad state", http.StatusTeapot)
	}))
	defer srv.Close()

	ch := &wledChannel{address: strings.TrimPrefix(srv.URL, "http://")}
	if err := ch.Write(true); err == nil {
		t.Fatal("expected non-200 setState response to fail")
	}
}

func TestWledChannel_Set_brightness(t *testing.T) {
	state := &wledState{On: false, Bri: 0}
	srv, addr := newTestServer(t, state)
	defer srv.Close()

	ch := &wledChannel{address: addr}
	if err := ch.Set(50); err != nil {
		t.Fatal(err)
	}
	if !state.On {
		t.Error("expected device on after Set(50)")
	}
	// 50% of 255 ≈ 128
	if state.Bri < 127 || state.Bri > 129 {
		t.Errorf("brightness = %d, want ~128", state.Bri)
	}
}

func TestWledChannel_Set_zero_turns_off(t *testing.T) {
	state := &wledState{On: true, Bri: 200}
	srv, addr := newTestServer(t, state)
	defer srv.Close()

	ch := &wledChannel{address: addr}
	if err := ch.Set(0); err != nil {
		t.Fatal(err)
	}
	if state.On {
		t.Error("expected device off after Set(0)")
	}
}

func TestWledChannel_Set_clampsBrightness(t *testing.T) {
	state := &wledState{On: false, Bri: 0}
	srv, addr := newTestServer(t, state)
	defer srv.Close()

	ch := &wledChannel{address: addr}
	if err := ch.Set(-10); err != nil {
		t.Fatal(err)
	}
	if state.On {
		t.Fatal("expected negative brightness to turn off")
	}
	if err := ch.Set(200); err != nil {
		t.Fatal(err)
	}
	if !state.On {
		t.Fatal("expected clamped high brightness to turn on")
	}
	if state.Bri != 255 {
		t.Fatalf("expected brightness 255, got %d", state.Bri)
	}
	if err := ch.Set(0.1); err != nil {
		t.Fatal(err)
	}
	if state.Bri != 1 {
		t.Fatalf("expected low positive brightness to clamp to 1, got %d", state.Bri)
	}
}
