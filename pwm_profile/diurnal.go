package pwm_profile

import (
	"encoding/json"
	"fmt"
	"math"
	"time"
)

type diurnal struct {
	start    time.Time
	end      time.Time
	min, max float64
}

func (d *diurnal) Get(t time.Time) float64 {
	s := time.Date(t.Year(), t.Month(), t.Day(), d.start.Hour(), d.start.Minute(), d.start.Second(), 0, t.Location())
	e := time.Date(t.Year(), t.Month(), t.Day(), d.end.Hour(), d.end.Minute(), d.end.Second(), 0, t.Location())
	if e.Before(s) {
		e = e.Add(time.Hour * 24)
		if t.Before(s) {
			t = t.Add(time.Hour * 24)
		}
	}
	if t.Before(s) {
		return 0
	}
	if t.After(e) {
		return 0
	}
	totalMinutes := int(e.Sub(s) / time.Minute)
	pastMinutes := int(t.Sub(s) / time.Minute)
	percent := float64(pastMinutes) * 2 * math.Pi / float64(totalMinutes)
	k := math.Pow(math.Cos(percent), 3)
	v := (1 - k) * float64(d.max-d.min)
	v = v + float64(d.min)
	if v > float64(d.max) {
		v = float64(d.max)
	}
	return v
}

func Diurnal(conf json.RawMessage, min, max float64) (*diurnal, error) {
	tFormat := "15:04"
	config := struct {
		Start string `json:"start"`
		End   string `json:"end"`
	}{}
	if err := json.Unmarshal(conf, &config); err != nil {
		return nil, err
	}
	s, err := time.Parse(tFormat, config.Start)
	if err != nil {
		return nil, fmt.Errorf("Failed to parse start time. Error:%s", err)
	}
	if max == 0 {
		max = 100
	}
	e, err := time.Parse(tFormat, config.End)
	if err != nil {
		return nil, fmt.Errorf("Failed to parse end time. Error:%s", err)
	}
	if min < 0 {
		return nil, fmt.Errorf("minimum should be 0 or above, supplied:%f", min)
	}
	if max > 100 || max <= min {
		return nil, fmt.Errorf("minimum should be equal or less than 100 and above supplied:%f", max)
	}
	return &diurnal{
		min:   min,
		max:   max,
		start: s,
		end:   e,
	}, nil

}
