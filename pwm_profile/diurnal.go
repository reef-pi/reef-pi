package pwm_profile

import (
	"encoding/json"
	"math"
	"time"
)

type diurnal temporal

func Diurnal(conf json.RawMessage, min, max float64) (*diurnal, error) {
	t, err := Temporal(conf, min, max)
	if err != nil {
		return nil, err
	}
	d := diurnal(t)
	return &d, nil

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
