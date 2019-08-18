package controller

import (
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Observation struct {
	Value  float64            `json:"value"`
	Upper  int                `json:"up"`
	Downer int                `json:"down"`
	Time   telemetry.TeleTime `json:"time"`
	total  float64
	len    int
}

func (o1 Observation) Rollup(o telemetry.Metric) (telemetry.Metric, bool) {
	o2 := o.(Observation)
	if o1.Time.Hour() != o2.Time.Hour() {
		return o, true
	}
	return Observation{
		Upper:  o1.Upper + o2.Upper,
		Downer: o1.Downer + o2.Downer,
		Time:   o1.Time,
		Value:  telemetry.TwoDecimal((o1.total + o2.Value) / float64(o1.len+1)),
		total:  o1.total + o2.Value,
		len:    o1.len + 1,
	}, false
}

func NewObservation(v float64) Observation {
	return Observation{
		Value: v,
		total: v,
		len:   1,
		Time:  telemetry.TeleTime(time.Now()),
	}
}

func (o1 Observation) Before(o2 telemetry.Metric) bool {
	return o1.Time.Before(o2.(Observation).Time)
}

type Homestatsis struct {
	UpperEq  string
	DownerEq string
	Min, Max float64
	Name     string
	Period   int
	T        telemetry.Telemetry
	Eqs      Subsystem
}

func (h *Homestatsis) EmitMetric(m string, v float64) {
	h.T.EmitMetric(h.Name, m, v)
}

func (h *Homestatsis) Sync(o *Observation) error {
	switch {
	case (o.Value > h.Max) && (h.DownerEq != ""):
		log.Printf("Current value of '%s' is above maximum threshold. Executing down routine\n", h.Name)
		if err := h.down(); err != nil {
			return err
		}
		o.Downer += h.Period
	case (o.Value < h.Min) && (h.UpperEq != ""):
		log.Printf("Current value of '%s' is below minimum threshold. Executing up routine\n", h.Name)
		if err := h.up(); err != nil {
			return err
		}
		o.Upper += int(h.Period)
	default:
		log.Printf("Current value of '%s' within range switching off control equipments\n", h.Name)
		h.switchOffAll()
	}
	if h.UpperEq != "" {
		h.EmitMetric("down", float64(o.Downer))
	}
	if h.DownerEq != "" {
		h.EmitMetric("up", float64(o.Upper))
	}
	return nil
}

func (h *Homestatsis) up() error {
	if h.DownerEq != "" {
		if err := h.Eqs.On(h.DownerEq, false); err != nil {
			return err
		}
	}
	if h.UpperEq != "" {
		if err := h.Eqs.On(h.UpperEq, true); err != nil {
			return err
		}
	}
	return nil
}

func (h *Homestatsis) down() error {
	if h.UpperEq != "" {
		if err := h.Eqs.On(h.UpperEq, false); err != nil {
			return err
		}
	}
	if h.DownerEq != "" {
		if err := h.Eqs.On(h.DownerEq, true); err != nil {
			return err
		}
	}
	return nil
}

func (h *Homestatsis) switchOffAll() error {
	if h.UpperEq != "" {
		if err := h.Eqs.On(h.UpperEq, false); err != nil {
			return err
		}
	}
	if h.DownerEq != "" {
		if err := h.Eqs.On(h.DownerEq, false); err != nil {
			return err
		}
	}
	return nil
}
