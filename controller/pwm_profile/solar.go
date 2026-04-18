package pwm_profile

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"sync"
	"time"
)

const _solarProfileName = "solar"

// solarConfig holds the user-supplied parameters for the solar profile.
type solarConfig struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// sunriseSunsetResponse is the JSON envelope returned by sunrise-sunset.org.
type sunriseSunsetResponse struct {
	Results struct {
		Sunrise string `json:"sunrise"`
		Sunset  string `json:"sunset"`
	} `json:"results"`
	Status string `json:"status"`
}

// solarFetcher is a function that retrieves sunrise/sunset for a given date and location.
// Swappable in tests.
type solarFetcher func(lat, lng float64, date time.Time) (sunrise, sunset time.Time, err error)

// solar is a diurnal-style profile whose start/end times are determined from
// real sunrise/sunset data fetched from sunrise-sunset.org.
type solar struct {
	solarConfig
	min, max float64
	fetcher  solarFetcher

	mu        sync.Mutex
	cacheDate time.Time // date for which sunrise/sunset were last fetched
	sunrise   time.Time
	sunset    time.Time
}

func (s *solar) Name() string { return _solarProfileName }

func (s *solar) refresh(now time.Time) {
	today := now.Truncate(24 * time.Hour)
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.cacheDate.IsZero() && s.cacheDate.Equal(today) {
		return // already cached for today
	}
	rise, set, err := s.fetcher(s.Latitude, s.Longitude, now)
	if err != nil {
		log.Println("solar profile: failed to fetch sunrise/sunset:", err)
		return
	}
	s.cacheDate = today
	s.sunrise = rise
	s.sunset = set
}

func (s *solar) Get(t time.Time) float64 {
	s.refresh(t)
	s.mu.Lock()
	rise, set := s.sunrise, s.sunset
	s.mu.Unlock()

	if rise.IsZero() || set.IsZero() {
		return 0
	}
	if t.Before(rise) || t.After(set) {
		return 0
	}
	total := set.Sub(rise).Seconds()
	if total <= 0 {
		return 0
	}
	past := t.Sub(rise).Seconds()
	percent := past * 2 * math.Pi / total
	k := math.Pow(math.Cos(percent), 3)
	v := (1-k)*float64(s.max-s.min) + float64(s.min)
	if v > float64(s.max) {
		v = float64(s.max)
	}
	return v
}

// Solar constructs a solar Profile from JSON config.
func Solar(conf json.RawMessage, min, max float64) (*solar, error) {
	return SolarWithFetcher(conf, min, max, fetchSunriseSunset)
}

// SolarWithFetcher is like Solar but accepts a custom fetcher, used in tests.
func SolarWithFetcher(conf json.RawMessage, min, max float64, fetcher solarFetcher) (*solar, error) {
	var cfg solarConfig
	if err := json.Unmarshal(conf, &cfg); err != nil {
		return nil, fmt.Errorf("solar profile: failed to parse config: %w", err)
	}
	if cfg.Latitude < -90 || cfg.Latitude > 90 {
		return nil, fmt.Errorf("solar profile: latitude %v out of range [-90, 90]", cfg.Latitude)
	}
	if cfg.Longitude < -180 || cfg.Longitude > 180 {
		return nil, fmt.Errorf("solar profile: longitude %v out of range [-180, 180]", cfg.Longitude)
	}
	if max == 0 {
		max = 100
	}
	return &solar{
		solarConfig: cfg,
		min:         min,
		max:         max,
		fetcher:     fetcher,
	}, nil
}

// fetchSunriseSunset calls the sunrise-sunset.org API (formatted=0 returns UTC RFC3339).
func fetchSunriseSunset(lat, lng float64, date time.Time) (sunrise, sunset time.Time, err error) {
	url := fmt.Sprintf(
		"https://api.sunrise-sunset.org/json?lat=%f&lng=%f&date=%s&formatted=0",
		lat, lng, date.Format("2006-01-02"),
	)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("solar profile: HTTP request failed: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("solar profile: failed to read response: %w", err)
	}
	var result sunriseSunsetResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("solar profile: failed to parse response: %w", err)
	}
	if result.Status != "OK" {
		return time.Time{}, time.Time{}, fmt.Errorf("solar profile: API returned status %q", result.Status)
	}
	rise, err := time.Parse(time.RFC3339, result.Results.Sunrise)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("solar profile: failed to parse sunrise %q: %w", result.Results.Sunrise, err)
	}
	set, err := time.Parse(time.RFC3339, result.Results.Sunset)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("solar profile: failed to parse sunset %q: %w", result.Results.Sunset, err)
	}
	return rise, set, nil
}
