package pwm_profile

import (
	"encoding/json"
	"math/rand"
	"time"
)

// lightning simulates a tropical lightning effect within a time window.
// During the window, random "flashes" occur at a configurable frequency.
// Each call to Get() checks whether the current time slot is a flash.
// For realistic effects, set the lighting tick interval to match FlashSlot.
type lightning struct {
	temporal
	Intensity float64 `json:"intensity"`  // flash peak value (0 = use max)
	Frequency float64 `json:"frequency"`  // average flashes per minute
	FlashSlot float64 `json:"flash_slot"` // slot duration in seconds; one flash decision per slot
}

func (l *lightning) Name() string {
	return _lightningProfileName
}

func Lightning(conf json.RawMessage, min, max float64) (*lightning, error) {
	t, err := Temporal(conf, min, max)
	if err != nil {
		return nil, err
	}
	var l lightning
	if err := json.Unmarshal(conf, &l); err != nil {
		return nil, err
	}
	l.temporal = t
	if l.FlashSlot <= 0 {
		l.FlashSlot = 1.0
	}
	if l.Frequency <= 0 {
		l.Frequency = 2.0
	}
	if l.Intensity <= 0 || l.Intensity > 100 {
		l.Intensity = max
	}
	return &l, nil
}

func (l *lightning) Get(t time.Time) float64 {
	if l.IsOutside(t) {
		return 0
	}
	elapsed := l.PastSeconds(t)
	slotIndex := int64(elapsed / l.FlashSlot)
	// probability that any given slot contains a flash
	prob := l.Frequency * l.FlashSlot / 60.0
	if prob > 1 {
		prob = 1
	}
	//nolint:gosec // fixed per-slot seed is intentional for deterministic lightning
	rng := rand.New(rand.NewSource(slotIndex))
	if rng.Float64() < prob {
		return l.Intensity
	}
	return 0
}
