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
	d, err := f.NewDriver(map[string]interface{}{paramAddress: "192.168.1.1"}, nil)
	if err != nil {
		t.Fatal(err)
	}
	pins := d.(hal.DigitalOutputDriver).DigitalOutputPins()
	if len(pins) != 1 {
		t.Fatalf("expected 1 digital output pin, got %d", len(pins))
	}
	channels := d.(hal.PWMDriver).PWMChannels()
	if len(channels) != 1 {
		t.Fatalf("expected 1 PWM channel, got %d", len(channels))
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
