package utils

import (
	"math"
	"time"
)

type PID struct {
	P, I, D    float64
	Min        float64
	Max        float64
	Setpoint   float64
	integral   float64
	prevValue  float64
	prevUpdate time.Time
}

func NewPID(p, i, d float64) *PID {
	return &PID{
		P:   p,
		I:   i,
		D:   d,
		Min: math.Inf(-1),
		Max: math.Inf(1),
	}
}

func (pid *PID) Update(v float64) float64 {
	var d time.Duration
	if !pid.prevUpdate.IsZero() {
		d = time.Since(pid.prevUpdate)
	}
	pid.prevUpdate = time.Now()
	return pid.UpdateDuration(v, d)
}

func (pid *PID) UpdateDuration(v float64, d time.Duration) float64 {

	var k float64
	dt := d.Seconds()
	delta := pid.Setpoint - v

	if dt > 0 {
		k = -((v - pid.prevValue) / dt)
	}

	pid.integral += delta * dt * pid.I
	pid.integral = pid.limit(pid.integral)
	pid.prevValue = v
	o := (delta * pid.P) + pid.integral + (pid.D * k)

	return pid.limit(o)
}

func (pid *PID) limit(v float64) float64 {
	if v > pid.Max {
		return pid.Max
	}
	if v < pid.Min {
		return pid.Min
	}
	return v
}
