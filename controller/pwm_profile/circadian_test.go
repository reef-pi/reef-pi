package pwm_profile

import (
	"encoding/json"
	"testing"
	"time"
)

func TestCircadian(t *testing.T) {
	// Test config for Sydney, Australia (approx lat: -33.8, long: 151.2)
	config := CircadianConfig{
		Latitude:  -33.8,
		Longitude: 151.2,
		StartHour: 6,
		EndHour:   22,
	}
	confBytes, _ := json.Marshal(config)
	
	p, err := NewCircadian(confBytes, 0, 100)
	if err != nil {
		t.Fatalf("Failed to create circadian profile: %v", err)
	}
	
	// Test noon (should be high brightness - between 50-100%)
	noon := time.Date(2026, 2, 21, 12, 0, 0, 0, time.UTC)
	intensity := p.Get(noon)
	t.Logf("Noon intensity: %.2f", intensity)
	if intensity < 50 || intensity > 100 {
		t.Errorf("Expected high intensity (50-100) at noon, got %.2f", intensity)
	}
	
	// Test midnight (should be min brightness - should be close to min)
	midnight := time.Date(2026, 2, 21, 0, 0, 0, 0, time.UTC)
	intensity = p.Get(midnight)
	t.Logf("Midnight intensity: %.2f", intensity)
	if intensity > 10 {
		t.Errorf("Expected low intensity (<10) at midnight, got %.2f", intensity)
	}
	
	// Test early morning (7 AM - should be ramping up)
	morning := time.Date(2026, 2, 21, 7, 0, 0, 0, time.UTC)
	intensity = p.Get(morning)
	t.Logf("7 AM intensity: %.2f", intensity)
	if intensity < 10 {
		t.Errorf("Expected some intensity (>10) at 7 AM, got %.2f", intensity)
	}
	
	// Test evening (20:00 - should be ramping down but still on)
	evening := time.Date(2026, 2, 21, 20, 0, 0, 0, time.UTC)
	intensity = p.Get(evening)
	t.Logf("20:00 intensity: %.2f", intensity)
	if intensity < 10 {
		t.Errorf("Expected some intensity (>10) at 20:00, got %.2f", intensity)
	}
	
	// Test 2 AM (deep night)
	deepNight := time.Date(2026, 2, 21, 2, 0, 0, 0, time.UTC)
	intensity = p.Get(deepNight)
	t.Logf("2 AM intensity: %.2f", intensity)
	if intensity > 5 {
		t.Errorf("Expected very low intensity (<5) at 2 AM, got %.2f", intensity)
	}
}

func TestCircadianInvalidLatitude(t *testing.T) {
	config := CircadianConfig{
		Latitude:  100, // Invalid
		Longitude: 151.2,
	}
	confBytes, _ := json.Marshal(config)
	
	_, err := NewCircadian(confBytes, 0, 100)
	if err == nil {
		t.Error("Expected error for invalid latitude")
	}
}

func TestCircadianInvalidLongitude(t *testing.T) {
	config := CircadianConfig{
		Latitude:  -33.8,
		Longitude: 200, // Invalid
	}
	confBytes, _ := json.Marshal(config)
	
	_, err := NewCircadian(confBytes, 0, 100)
	if err == nil {
		t.Error("Expected error for invalid longitude")
	}
}

func TestCircadianWithMinMax(t *testing.T) {
	config := CircadianConfig{
		Latitude:  40.0,
		Longitude: -74.0,
		StartHour: 8,
		EndHour:   20,
	}
	confBytes, _ := json.Marshal(config)
	
	// Test with non-zero min (e.g., moonlight level)
	p, err := NewCircadian(confBytes, 10, 80)
	if err != nil {
		t.Fatalf("Failed to create circadian profile: %v", err)
	}
	
	// Midnight should be at min
	midnight := time.Date(2026, 6, 21, 0, 0, 0, 0, time.UTC)
	intensity := p.Get(midnight)
	t.Logf("Midnight with min=10: %.2f", intensity)
	if intensity < 9 || intensity > 12 {
		t.Errorf("Expected intensity near min (10) at midnight, got %.2f", intensity)
	}
	
	// Noon should be below max due to seasonal adjustment
	noon := time.Date(2026, 6, 21, 12, 0, 0, 0, time.UTC)
	intensity = p.Get(noon)
	t.Logf("Noon with max=80: %.2f", intensity)
	if intensity > 80 {
		t.Errorf("Expected intensity at or below max (80), got %.2f", intensity)
	}
}
