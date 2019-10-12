package pwm_profile

import (
	"encoding/json"
	"fmt"
	"math"
	"time"
)

const _lunarCycleSpan = 30

type lunar struct {
	temporal
	fullMoon time.Time
	FullMoon string `json:"full_moon"`
}

func Lunar(conf json.RawMessage, min, max float64) (lunar, error) {
	tFormat := "Jan 2 2006"
	var l lunar
	if err := json.Unmarshal(conf, &l); err != nil {
		return l, err
	}
	if err := l.Build(min, max); err != nil {
		return l, err
	}
	fullMoon, err := time.Parse(tFormat, l.FullMoon)
	if err != nil {
		return l, fmt.Errorf("Failed to parse full moon date. Error:%s", err)
	}
	l.fullMoon = fullMoon
	return l, nil
}

func (l lunar) Get(t time.Time) float64 {
	daysPast := int(t.Sub(l.fullMoon).Hours()/24) % _lunarCycleSpan
	v := 1 - math.Sin(float64(daysPast)/float64(_lunarCycleSpan)*math.Pi)
	max := l.min + v*l.ValueRange()
	temp := temporal{
		min:   l.min,
		max:   max,
		start: l.start,
		end:   l.end,
	}
	p := sine{
		temp,
	}
	return p.Get(t)
}
