package pwm_profile

import (
	"encoding/json"
	"testing"
	"time"
)

func TestLightning(t *testing.T) {
	conf := map[string]interface{}{
		"start":      "14:00:00",
		"end":        "18:00:00",
		"intensity":  100,
		"frequency":  60, // 60/min = guaranteed flash (prob=1 with FlashSlot=1)
		"flash_slot": 1,
	}
	b, _ := json.Marshal(conf)
	l, err := Lightning(b, 0, 100)
	if err != nil {
		t.Fatal("Failed to create lightning profile:", err)
	}
	if l.Name() != _lightningProfileName {
		t.Errorf("Expected name %s, got %s", _lightningProfileName, l.Name())
	}

	// outside window returns 0
	outsideTime := time.Date(2020, 1, 1, 8, 0, 0, 0, time.UTC)
	if v := l.Get(outsideTime); v != 0 {
		t.Errorf("Expected 0 outside window, got %f", v)
	}

	// at freq=60/min with 1s slots, prob=1 — every slot should be a flash
	inWindow := time.Date(2020, 1, 1, 15, 0, 0, 0, time.UTC)
	if v := l.Get(inWindow); v != 100 {
		t.Errorf("Expected 100 at freq=60, got %f", v)
	}
}

func TestLightningDefaults(t *testing.T) {
	conf := map[string]interface{}{
		"start": "10:00:00",
		"end":   "16:00:00",
	}
	b, _ := json.Marshal(conf)
	l, err := Lightning(b, 0, 100)
	if err != nil {
		t.Fatal("Failed to create lightning profile with defaults:", err)
	}
	if l.FlashSlot != 1.0 {
		t.Errorf("Expected default FlashSlot=1, got %f", l.FlashSlot)
	}
	if l.Frequency != 2.0 {
		t.Errorf("Expected default Frequency=2, got %f", l.Frequency)
	}
	if l.Intensity != 100 {
		t.Errorf("Expected default Intensity=max=100, got %f", l.Intensity)
	}
}

func TestLightningZeroFrequency(t *testing.T) {
	conf := map[string]interface{}{
		"start":      "10:00:00",
		"end":        "16:00:00",
		"frequency":  0.001, // near-zero: almost never flashes
		"flash_slot": 1,
		"intensity":  100,
	}
	b, _ := json.Marshal(conf)
	l, err := Lightning(b, 0, 100)
	if err != nil {
		t.Fatal(err)
	}
	// prob = 0.001/60 ≈ 0.0000167 — very unlikely to get a flash in a small sample
	flashCount := 0
	base := time.Date(2020, 1, 1, 12, 0, 0, 0, time.UTC)
	for i := 0; i < 100; i++ {
		tick := base.Add(time.Duration(i) * time.Second)
		if l.Get(tick) > 0 {
			flashCount++
		}
	}
	// With prob ~0.0000167 per slot, expect 0 flashes in 100 samples
	if flashCount > 1 {
		t.Errorf("Expected near-zero flash count, got %d", flashCount)
	}
}

func TestLightningDeterminism(t *testing.T) {
	conf := map[string]interface{}{
		"start":      "10:00:00",
		"end":        "16:00:00",
		"frequency":  10,
		"flash_slot": 1,
		"intensity":  80,
	}
	b, _ := json.Marshal(conf)
	l, err := Lightning(b, 0, 100)
	if err != nil {
		t.Fatal(err)
	}
	// same time should always return the same value
	tick := time.Date(2020, 1, 1, 13, 30, 15, 0, time.UTC)
	v1 := l.Get(tick)
	v2 := l.Get(tick)
	if v1 != v2 {
		t.Errorf("Get() is not deterministic: %f != %f", v1, v2)
	}
}
