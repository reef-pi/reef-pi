package pwm_profile

import (
	"encoding/json"
	"fmt"
	"math"
	"time"
)

const (
	_lunarCycleSpan   = 30
	_lunarDailyFormat = "Jan 2"

	FullMoonFormat = "Jan 2 2006"
)

type lunar struct {
	temporal
	fullMoon     time.Time
	FullMoon     string `json:"full_moon"`
	dailyProfile Profile
	previousDay  string
}

func Lunar(conf json.RawMessage, min, max float64) (*lunar, error) {
	var l lunar
	if err := json.Unmarshal(conf, &l); err != nil {
		return nil, err
	}
	if err := l.Build(min, max); err != nil {
		return nil, err
	}
	fullMoon, err := time.Parse(FullMoonFormat, l.FullMoon)
	if err != nil {
		return nil, fmt.Errorf("Failed to parse full moon date. Error:%s", err)
	}
	l.fullMoon = fullMoon
	return &l, nil
}

func (l *lunar) Get(t time.Time) float64 {
	d := t.Format(_lunarDailyFormat)
	if l.dailyProfile == nil || l.previousDay != d {
		l.buildDailyProfile(t)
		l.previousDay = d
	}
	return l.dailyProfile.Get(t)
}

func (l *lunar) buildDailyProfile(t time.Time) {
	daysPast := int(t.Sub(l.fullMoon).Hours()/24) % _lunarCycleSpan
	v := 1 - math.Sin(float64(daysPast)/float64(_lunarCycleSpan)*math.Pi)
	max := l.min + v*l.ValueRange()
	l.dailyProfile = &sine{
		temporal{
			min:   l.min,
			max:   max,
			start: l.start,
			end:   l.end,
		},
	}
}
