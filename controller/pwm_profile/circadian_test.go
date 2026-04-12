package pwm_profile

import (
	"encoding/json"
	"math"
	"testing"
	"time"
)

func circadianConf(start, end string, dawn, noon float64) json.RawMessage {
	b, _ := json.Marshal(map[string]interface{}{
		"start":      start,
		"end":        end,
		"dawn_value": dawn,
		"noon_value": noon,
	})
	return b
}

func TestCircadianBlueChannel(t *testing.T) {
	// Blue channel: low at dawn, high at noon
	c, err := Circadian(circadianConf("06:00:00", "18:00:00", 10, 100), 0, 100)
	if err != nil {
		t.Fatal("unexpected error:", err)
	}
	if c.Name() != _circadianProfileName {
		t.Errorf("expected name %q, got %q", _circadianProfileName, c.Name())
	}

	now := time.Now()
	// At start time: value should be dawn_value = 10
	tStart := time.Date(now.Year(), now.Month(), now.Day(), 6, 0, 0, 0, now.Location())
	vStart := c.Get(tStart)
	if math.Abs(vStart-10) > 0.01 {
		t.Errorf("expected dawn_value=10 at start, got %.4f", vStart)
	}

	// At midpoint (noon): value should be noon_value = 100
	tNoon := time.Date(now.Year(), now.Month(), now.Day(), 12, 0, 0, 0, now.Location())
	vNoon := c.Get(tNoon)
	if math.Abs(vNoon-100) > 0.01 {
		t.Errorf("expected noon_value=100 at noon, got %.4f", vNoon)
	}

	// Outside window: value should be 0
	tNight := time.Date(now.Year(), now.Month(), now.Day(), 22, 0, 0, 0, now.Location())
	vNight := c.Get(tNight)
	if vNight != 0 {
		t.Errorf("expected 0 outside window, got %.4f", vNight)
	}
}

func TestCircadianWarmChannel(t *testing.T) {
	// Warm channel: high at dawn, low at noon — inverted from blue
	c, err := Circadian(circadianConf("06:00:00", "18:00:00", 80, 5), 0, 100)
	if err != nil {
		t.Fatal("unexpected error:", err)
	}

	now := time.Now()
	tStart := time.Date(now.Year(), now.Month(), now.Day(), 6, 0, 0, 0, now.Location())
	vStart := c.Get(tStart)
	if math.Abs(vStart-80) > 0.01 {
		t.Errorf("expected dawn_value=80 at start, got %.4f", vStart)
	}

	tNoon := time.Date(now.Year(), now.Month(), now.Day(), 12, 0, 0, 0, now.Location())
	vNoon := c.Get(tNoon)
	if math.Abs(vNoon-5) > 0.01 {
		t.Errorf("expected noon_value=5 at noon, got %.4f", vNoon)
	}
}

func TestCircadianValidation(t *testing.T) {
	tests := []struct {
		name    string
		dawn    float64
		noon    float64
		wantErr bool
	}{
		{"valid blue", 10, 100, false},
		{"valid warm", 80, 5, false},
		{"dawn == noon", 50, 50, true},
		{"dawn negative", -1, 100, true},
		{"dawn > 100", 101, 50, true},
		{"noon negative", 10, -1, true},
		{"noon > 100", 10, 101, true},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			_, err := Circadian(circadianConf("06:00:00", "18:00:00", tc.dawn, tc.noon), 0, 100)
			if tc.wantErr && err == nil {
				t.Error("expected error, got nil")
			}
			if !tc.wantErr && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}
