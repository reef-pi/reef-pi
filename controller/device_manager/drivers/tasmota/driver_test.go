package tasmota

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
	if meta.Name == "" {
		t.Error("expected non-empty driver name")
	}
	caps := meta.Capabilities
	found := false
	for _, c := range caps {
		if c == hal.DigitalOutput {
			found = true
		}
	}
	if !found {
		t.Error("expected DigitalOutput capability")
	}
}

func TestFactory_validateParameters(t *testing.T) {
	f := Factory()
	ok, _ := f.ValidateParameters(map[string]interface{}{
		paramAddress: "192.168.1.1",
		paramOutlets: "2",
	})
	if !ok {
		t.Error("expected valid parameters")
	}

	ok, failures := f.ValidateParameters(map[string]interface{}{})
	if ok {
		t.Error("expected validation failure for missing address")
	}
	if len(failures[paramAddress]) == 0 {
		t.Error("expected address failure message")
	}
}

func TestFactory_newDriver_singleOutlet(t *testing.T) {
	f := Factory()
	d, err := f.NewDriver(map[string]interface{}{
		paramAddress: "192.168.1.1",
		paramOutlets: "1",
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	pins := d.(hal.DigitalOutputDriver).DigitalOutputPins()
	if len(pins) != 1 {
		t.Fatalf("expected 1 pin, got %d", len(pins))
	}
}

func TestFactory_newDriver_multiOutlet(t *testing.T) {
	f := Factory()
	d, err := f.NewDriver(map[string]interface{}{
		paramAddress: "192.168.1.1",
		paramOutlets: "4",
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	pins := d.(hal.DigitalOutputDriver).DigitalOutputPins()
	if len(pins) != 4 {
		t.Fatalf("expected 4 pins, got %d", len(pins))
	}
	for i, p := range pins {
		if p.Number() != i {
			t.Errorf("pin[%d].Number() = %d, want %d", i, p.Number(), i)
		}
	}
}

func newTestServer(t *testing.T, handler http.HandlerFunc) (*httptest.Server, string) {
	t.Helper()
	srv := httptest.NewServer(handler)
	// strip "http://" to get just host:port
	addr := strings.TrimPrefix(srv.URL, "http://")
	return srv, addr
}

func TestOutletPin_Write(t *testing.T) {
	var lastCmd string
	srv, addr := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		lastCmd = r.URL.Query().Get("cmnd")
		json.NewEncoder(w).Encode(map[string]string{"POWER2": "ON"})
	})
	defer srv.Close()

	pin := &outletPin{index: 2, address: addr}
	if err := pin.Write(true); err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(lastCmd, "Power2") {
		t.Errorf("expected Power2 command, got %q", lastCmd)
	}
}

func TestOutletPin_LastState(t *testing.T) {
	srv, addr := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"POWER3": "ON"})
	})
	defer srv.Close()

	pin := &outletPin{index: 3, address: addr}
	if !pin.LastState() {
		t.Error("expected LastState() = true")
	}
}

func TestOutletPin_Auth(t *testing.T) {
	var receivedURL string
	srv, addr := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		receivedURL = r.URL.RawQuery
		json.NewEncoder(w).Encode(map[string]string{"POWER1": "OFF"})
	})
	defer srv.Close()

	pin := &outletPin{index: 1, address: addr, username: "admin", password: "secret"}
	_ = pin.Write(false)
	if !strings.Contains(receivedURL, "user=admin") {
		t.Errorf("expected auth params in URL, got %q", receivedURL)
	}
}
