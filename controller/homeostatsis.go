package controller

import (
	"fmt"
	"log"
	"math"
	"time"

	"github.com/reef-pi/reef-pi/controller/utils"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type target uint

const (
	noTarget target = iota
	upperTarget
	downerTarget
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
		Value:  utils.RoundToTwoDecimal((o1.total + o2.Value) / float64(o1.len+1)),
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
	o, ok := o2.(Observation)
	if !ok {
		return false
	}
	return o1.Time.Before(o.Time)
}

type HomeoStasisConfig struct {
	Name       string
	IsMacro    bool
	Period     int
	Upper      string
	Downer     string
	Min, Max   float64
	Hysteresis float64
}

type Homeostasis struct {
	config     HomeoStasisConfig
	t          telemetry.Telemetry
	eqs        Subsystem
	macros     Subsystem
	pastTarget target
}

func NewHomeostasis(c Controller, config HomeoStasisConfig) *Homeostasis {
	h := Homeostasis{
		config:     config,
		t:          c.Telemetry(),
		eqs:        NoopSubsystem(),
		macros:     NoopSubsystem(),
		pastTarget: noTarget,
	}
	if sub, err := c.Subsystem(storage.MacroBucket); err == nil {
		h.macros = sub
	}
	if sub, err := c.Subsystem(storage.EquipmentBucket); err == nil {
		h.eqs = sub
	}
	return &h
}

// a very basic equivalent of errors.Join, but works for go < 1.2
func BasicErrJoin(prevErr error, newErr error) error {
	if prevErr != nil {
		return fmt.Errorf("%w; %v", newErr, prevErr.Error())
	} else {
		return newErr
	}
}

func (h *Homeostasis) Sub() Subsystem {
	if h.config.IsMacro {
		return h.macros
	}
	return h.eqs
}

func (h *Homeostasis) EmitMetric(m string, v float64) {
	h.t.EmitMetric(h.config.Name, m, v)
}

func (h *Homeostasis) Sync(o *Observation) error {
	switch {
	case (o.Value > h.config.Max) && (h.config.Downer != ""):
		log.Printf("Current value of '%s' is above maximum threshold. Executing down routine\n", h.config.Name)
		if err := h.down(); err != nil {
			return err
		}
		o.Downer += h.config.Period
		h.pastTarget = downerTarget
	case (o.Value < h.config.Min) && (h.config.Upper != ""):
		log.Printf("Current value of '%s' is below minimum threshold. Executing up routine\n", h.config.Name)
		if err := h.up(); err != nil {
			return err
		}
		o.Upper += int(h.config.Period)
		h.pastTarget = upperTarget
	case h.pastTarget == downerTarget && math.Abs(o.Value-h.config.Max) < h.config.Hysteresis:
		log.Printf("Current value of '%s' is within max threshold hysteresis, continue executing down routine\n", h.config.Name)
		if h.pastTarget == downerTarget {
			o.Downer += int(h.config.Period)
		}
	case h.pastTarget == upperTarget && math.Abs(o.Value-h.config.Min) < h.config.Hysteresis:
		log.Printf("Current value of '%s' is within min threshold hysteresis, continue executing up routine\n", h.config.Name)
		if h.pastTarget == upperTarget {
			o.Upper += int(h.config.Period)
		}
	default:
		log.Printf("Current value of '%s' within range switching off control equipments\n", h.config.Name)
		h.switchOffAll()
		h.pastTarget = noTarget
	}
	if h.config.Upper != "" {
		h.EmitMetric("down", float64(o.Downer))
	}
	if h.config.Downer != "" {
		h.EmitMetric("up", float64(o.Upper))
	}
	return nil
}

func (h *Homeostasis) up() error {
	var result error

	if h.config.Downer != "" {
		if err := h.Sub().On(h.config.Downer, false); err != nil {
			result = BasicErrJoin(result, err)
		}
	}
	if h.config.Upper != "" {
		if err := h.Sub().On(h.config.Upper, true); err != nil {
			result = BasicErrJoin(result, err)
		}
	}
	return result
}

func (h *Homeostasis) down() error {
	var result error

	if h.config.Upper != "" {
		if err := h.Sub().On(h.config.Upper, false); err != nil {
			result = BasicErrJoin(result, err)
		}
	}
	if h.config.Downer != "" {
		if err := h.Sub().On(h.config.Downer, true); err != nil {
			result = BasicErrJoin(result, err)
		}
	}
	return result
}

func (h *Homeostasis) switchOffAll() error {
	var result error

	if h.config.Upper != "" {
		if err := h.Sub().On(h.config.Upper, false); err != nil {
			result = BasicErrJoin(result, err)
		}
	}
	if h.config.Downer != "" {
		if err := h.Sub().On(h.config.Downer, false); err != nil {
			result = BasicErrJoin(result, err)
		}
	}
	return result
}
