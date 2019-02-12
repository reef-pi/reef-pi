package doser

import (
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Usage struct {
	Pump int                `json:"pump"`
	Time telemetry.TeleTime `json:"time"`
}

func (u1 Usage) Rollup(ux telemetry.Metric) (telemetry.Metric, bool) {
	u2 := ux.(Usage)
	u := Usage{Time: u1.Time, Pump: u1.Pump}
	if u1.Time.Day() == u2.Time.Day() {
		u.Pump += u2.Pump
		return u, false
	}
	return u2, true
}

func (u1 Usage) Before(ux telemetry.Metric) bool {
	u2 := ux.(Usage)
	return u1.Time.Before(u2.Time)
}
