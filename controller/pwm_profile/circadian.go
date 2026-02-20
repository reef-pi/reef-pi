package pwm_profile

import (
	"encoding/json"
	"math"
	"time"
)

// CircadianConfig holds configuration for circadian lighting
type CircadianConfig struct {
	Latitude  float64 `json:"latitude"`  // Latitude (-90 to 90) - used for seasonal adjustment
	Longitude float64 `json:"longitude"` // Longitude (-180 to 180)
	StartHour int     `json:"start_hour"` // When lighting starts ramping up (default: 6)
	EndHour   int     `json:"end_hour"`   // When lighting starts ramping down (default: 22)
}

// circadian implements a circadian rhythm profile based on solar position
type circadian struct {
	min       float64
	max       float64
	config    CircadianConfig
	startHour float64
	endHour   float64
}

// Name returns the profile name
func (c *circadian) Name() string {
	return _circadianProfileName
}

// NewCircadian creates a new circadian profile
func NewCircadian(conf json.RawMessage, min, max float64) (*circadian, error) {
	var config CircadianConfig
	if err := json.Unmarshal(conf, &config); err != nil {
		return nil, err
	}

	// Validate coordinates
	if config.Latitude < -90 || config.Latitude > 90 {
		return nil, ErrInvalidLatitude
	}
	if config.Longitude < -180 || config.Longitude > 180 {
		return nil, ErrInvalidLongitude
	}

	// Default hours if not set
	if config.StartHour == 0 {
		config.StartHour = 6
	}
	if config.EndHour == 0 {
		config.EndHour = 22
	}

	return &circadian{
		min:       min,
		max:       max,
		config:    config,
		startHour: float64(config.StartHour),
		endHour:   float64(config.EndHour),
	}, nil
}

// Get returns the light intensity for the given time
// Uses a combination of time-based curves and latitude for seasonal adjustment
func (c *circadian) Get(t time.Time) float64 {
	hour := float64(t.Hour()) + float64(t.Minute())/60.0

	// Day of year for seasonal adjustment (affects curve width)
	yearDay := float64(t.YearDay())
	
	// Seasonal factor based on latitude and day of year
	// Summer (day ~172) = higher max, Winter (day ~355/0) = lower max
	seasonalFactor := math.Cos((yearDay - 172) * 2 * math.Pi / 365.0)
	latitudeEffect := math.Abs(c.config.Latitude) / 90.0 // 0 at equator, 1 at poles
	seasonalMax := 1.0 - (latitudeEffect * 0.3 * (1 - seasonalFactor))
	if seasonalMax < 0.5 {
		seasonalMax = 0.5
	}
	
	// Calculate intensity based on time of day
	var intensity float64
	dayLength := c.endHour - c.startHour
	
	if hour < c.startHour {
		// Before start hour - night mode (with dim dawn effect)
		if hour < c.startHour-2 {
			// Deep night
			intensity = c.min
		} else {
			// Dawn ramp
			progress := (hour - (c.startHour - 2)) / 2
			intensity = c.min + (c.max*c.min*seasonalMax-c.min)*progress
		}
	} else if hour > c.endHour {
		// After end hour - night mode (with dim dusk effect)
		if hour > c.endHour+2 {
			// Deep night
			intensity = c.min
		} else {
			// Dusk ramp
			progress := (hour - c.endHour) / 2
			intensity = c.max * seasonalMax * (1 - progress)
		}
	} else {
		// Daytime - use bell curve (sine-based)
		dayProgress := (hour - c.startHour) / dayLength // 0 to 1
		// Sine curve for natural lighting: starts low, peaks at noon, ends low
		sineValue := math.Sin(dayProgress * math.Pi)
		intensity = c.min + (c.max*seasonalMax-c.min)*sineValue
	}
	
	// Clamp to min/max
	if intensity > c.max {
		intensity = c.max
	}
	if intensity < c.min {
		intensity = c.min
	}
	
	return intensity
}

// Error messages
var (
	ErrInvalidLatitude  = &profileError{"latitude must be between -90 and 90"}
	ErrInvalidLongitude = &profileError{"longitude must be between -180 and 180"}
)

type profileError struct {
	message string
}

func (e *profileError) Error() string {
	return e.message
}

// CircadianProfileSpec is a convenience method to check if this is a circadian config
func CircadianProfileSpec(spec ProfileSpec) bool {
	return spec.Type == _circadianProfileName
}
