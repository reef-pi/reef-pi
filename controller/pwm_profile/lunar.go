package pwm_profile

import (
	"encoding/json"
	"fmt"
	"math"
	"time"
)

const (
	_lunarCycleSpan   = 27
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

func (l *lunar) Name() string {
	return _lunarProfileName
}

func Lunar(conf json.RawMessage, min, max float64) (*lunar, error) {
	var l lunar
	if err := json.Unmarshal(conf, &l); err != nil {
		return nil, err
	}
	if err := l.Build(min, max); err != nil {
	}
	fullMoon, err := time.Parse(FullMoonFormat, l.FullMoon)
	if err != nil {
		return nil, fmt.Errorf("Failed to parse full moon date. Error:%s", err)
	}
	l.fullMoon = fullMoon
	if err := l.buildDailyProfile(time.Now()); err != nil {
		return nil, err
	}
	return &l, nil
}

func (l *lunar) Get(t time.Time) float64 {
	d := t.Format(_lunarDailyFormat)
	if l.dailyProfile == nil || (l.previousDay != d && l.IsOutside(t)) {
		if err := l.buildDailyProfile(t); err != nil {
			return 0
		}
		l.previousDay = d
	}
	return l.dailyProfile.Get(t)
}

func (l *lunar) buildDailyProfile(t time.Time) error {
	daysPast := math.Mod(t.Sub(l.fullMoon).Hours()/24, _lunarCycleSpan)
	v := 1 - math.Sin(daysPast/_lunarCycleSpan*math.Pi)
	max := l.min + v*l.ValueRange()
	temp, err := NewTemporal(l.start.Format(tFormat), l.end.Format(tFormat), l.min, max)
	if err != nil {
		return err
	}
	l.dailyProfile = &sine{temp}
	return nil
}
