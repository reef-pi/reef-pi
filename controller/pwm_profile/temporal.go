package pwm_profile

import (
	"encoding/json"
	"fmt"
	"time"
)

// a temporal profile has time bounds (start and end time, and the value at any given time is calculated considering those
type temporal struct {
	start    time.Time
	end      time.Time
	min, max float64
	Start    string `json:"start"`
	End      string `json:"end"`
}

func Temporal(conf json.RawMessage, min, max float64) (temporal, error) {
	var t temporal
	if err := json.Unmarshal(conf, &t); err != nil {
		return t, err
	}
	if err := t.Build(min, max); err != nil {
		return t, err
	}
	return t, nil
}

func (t *temporal) Build(min, max float64) error {
	t.max = max
	t.min = min
	tFormat := "15:04"
	start, err := time.Parse(tFormat, t.Start)
	if err != nil {
		return fmt.Errorf("Failed to parse start time. Error:%s", err)
	}
	if t.max == 0 {
		t.max = 100
	}
	end, err := time.Parse(tFormat, t.End)
	if err != nil {
		return fmt.Errorf("Failed to parse end time. Error:%s", err)
	}
	if end.Before(start) {
		end = end.Add(time.Hour * 24)
	}
	if t.min < 0 {
		return fmt.Errorf("minimum should be 0 or above, supplied:%f", t.min)
	}
	if t.max > 100 || t.max <= t.min {
		return fmt.Errorf("minimum should be equal or less than 100 and above supplied:%f", t.max)
	}
	t.start = start
	t.end = end
	return nil
}

func remap(t1, t2 time.Time) time.Time {
	return time.Date(t1.Year(), t1.Month(), t1.Day(), t2.Hour(), t2.Minute(), t2.Second(), 0, t1.Location())
}

func (t *temporal) ValueRange() float64 {
	return t.max - t.min
}

func (t *temporal) TotalMinutes() int {
	return int(t.end.Sub(t.start) / time.Minute)
}
func (t *temporal) TotalSeconds() int {
	return int(t.end.Sub(t.start) / time.Second)
}

func (t *temporal) PastMinutes(t1 time.Time) int {
	return int(t1.Sub(remap(t1, t.start)) / time.Minute)
}
func (t *temporal) PastSeconds(t1 time.Time) int {
	return int(t1.Sub(remap(t1, t.start)) / time.Second)
}

func (t *temporal) MapStartEnd(t1 time.Time) (time.Time, time.Time) {
	return remap(t1, t.start), remap(t1, t.end)
}

func (t *temporal) IsOutside(t1 time.Time) bool {
	start, end := t.MapStartEnd(t1)
	if end.Before(start) {
		end = end.Add(time.Hour * 24)
		if t1.Before(start) {
			t1 = t1.Add(time.Hour * 24)
		}
	}
	if t1.Before(start) {
		return true
	}
	if t1.After(end) {
		return true
	}
	return false
}
