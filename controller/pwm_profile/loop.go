package pwm_profile

import (
	"encoding/json"
	"fmt"
	"sync"
	"time"
)

type loop struct {
	sync.Mutex
	Values []float64 `json:"values"`
	i, l   int
}

func (l *loop) Get(_ time.Time) float64 {
	v := l.Values[l.i]
	l.i++
	l.i = l.i % l.l
	return v
}

func Loop(conf json.RawMessage) (*loop, error) {
	var l loop
	if err := json.Unmarshal(conf, &l); err != nil {
		return nil, err
	}
	if len(l.Values) < 2 {
		return nil, fmt.Errorf("number of values has to be 2 or greater")
	}
	l.l = len(l.Values)
	return &l, nil
}
