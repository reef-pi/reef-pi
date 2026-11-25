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

	// Use a fixed noon UTC time so the 3 calls never straddle a UTC-day boundary.
	now := time.Date(2026, 1, 15, 12, 0, 0, 0, time.UTC)
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

func TestSolar_CacheUsesLocalDay(t *testing.T) {
	loc, err := time.LoadLocation("America/Los_Angeles")
	if err != nil {
		t.Skip("time zone data not available:", err)
	}
	fetcher := func(lat, lng float64, date time.Time) (time.Time, time.Time, error) {
		y, m, d := date.Date()
		return time.Date(y, m, d, 7, 0, 0, 0, date.Location()), time.Date(y, m, d, 18, 0, 0, 0, date.Location()), nil
	}
	cfg, _ := json.Marshal(solarConfig{Latitude: 34.05, Longitude: -118.24})
	s, _ := SolarWithFetcher(cfg, 0, 100, fetcher)

	// 17:30 in Los Angeles is already the next day in UTC.
	s.Get(time.Date(2026, 10, 24, 17, 30, 0, 0, loc))
	if v := s.Get(time.Date(2026, 10, 25, 12, 0, 0, 0, loc)); v <= 0 {
		t.Errorf("noon on the next local day: Get() = %v, want > 0 (stale sunrise/sunset from the previous day)", v)
	}
}
