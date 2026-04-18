package pwm_profile

import (
	"encoding/json"
	"testing"
	"time"
)

func mockFetcher(rise, set time.Time) solarFetcher {
	return func(lat, lng float64, date time.Time) (time.Time, time.Time, error) {
		return rise, set, nil
	}
}

func makeSolar(t *testing.T, lat, lng, min, max float64, rise, set time.Time) *solar {
	t.Helper()
	cfg, _ := json.Marshal(solarConfig{Latitude: lat, Longitude: lng})
	s, err := SolarWithFetcher(cfg, min, max, mockFetcher(rise, set))
	if err != nil {
		t.Fatalf("SolarWithFetcher: %v", err)
	}
	return s
}

func TestSolar_Name(t *testing.T) {
	s := makeSolar(t, 37.7, -122.4, 0, 100, time.Now(), time.Now().Add(12*time.Hour))
	if s.Name() != _solarProfileName {
		t.Errorf("Name() = %q, want %q", s.Name(), _solarProfileName)
	}
}

func TestSolar_ZeroOutsideSunriseSunset(t *testing.T) {
	now := time.Now()
	rise := now.Add(1 * time.Hour)
	set := now.Add(13 * time.Hour)
	s := makeSolar(t, 37.7, -122.4, 0, 100, rise, set)

	// Before sunrise
	if v := s.Get(now); v != 0 {
		t.Errorf("before sunrise: Get() = %v, want 0", v)
	}
	// After sunset
	if v := s.Get(now.Add(14 * time.Hour)); v != 0 {
		t.Errorf("after sunset: Get() = %v, want 0", v)
	}
}

func TestSolar_NonZeroDuringDay(t *testing.T) {
	now := time.Now()
	rise := now.Add(-6 * time.Hour)
	set := now.Add(6 * time.Hour)
	s := makeSolar(t, 37.7, -122.4, 0, 100, rise, set)

	v := s.Get(now)
	if v <= 0 || v > 100 {
		t.Errorf("at solar noon: Get() = %v, want value in (0, 100]", v)
	}
}

func TestSolar_PeakAtNoon(t *testing.T) {
	now := time.Now()
	rise := now.Add(-6 * time.Hour)
	set := now.Add(6 * time.Hour)
	s := makeSolar(t, 37.7, -122.4, 0, 100, rise, set)

	noon := now
	earlyMorning := now.Add(-5 * time.Hour)
	lateAfternoon := now.Add(5 * time.Hour)

	vNoon := s.Get(noon)
	vMorning := s.Get(earlyMorning)
	vAfternoon := s.Get(lateAfternoon)

	if vNoon <= vMorning {
		t.Errorf("noon (%v) should be brighter than morning (%v)", vNoon, vMorning)
	}
	if vNoon <= vAfternoon {
		t.Errorf("noon (%v) should be brighter than afternoon (%v)", vNoon, vAfternoon)
	}
}

func TestSolar_CachesForDay(t *testing.T) {
	calls := 0
	fetcher := func(lat, lng float64, date time.Time) (time.Time, time.Time, error) {
		calls++
		return date.Add(6 * time.Hour), date.Add(18 * time.Hour), nil
	}
	cfg, _ := json.Marshal(solarConfig{Latitude: 37.7, Longitude: -122.4})
	s, _ := SolarWithFetcher(cfg, 0, 100, fetcher)

	now := time.Now()
	s.Get(now)
	s.Get(now.Add(1 * time.Hour))
	s.Get(now.Add(2 * time.Hour))

	if calls != 1 {
		t.Errorf("expected 1 API call for same day, got %d", calls)
	}
}

func TestSolar_InvalidConfig(t *testing.T) {
	cfg, _ := json.Marshal(solarConfig{Latitude: 200, Longitude: 0})
	_, err := Solar(cfg, 0, 100)
	if err == nil {
		t.Error("expected error for invalid latitude")
	}

	cfg2, _ := json.Marshal(solarConfig{Latitude: 0, Longitude: 300})
	_, err = Solar(cfg2, 0, 100)
	if err == nil {
		t.Error("expected error for invalid longitude")
	}
}
