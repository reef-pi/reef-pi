package doser

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/types"
)

type Usage struct {
	Pump int            `json:"pump"`
	Time utils.TeleTime `json:"time"`
}

func (u1 Usage) Rollup(ux types.Metric) (types.Metric, bool) {
	u2 := ux.(Usage)
	u := Usage{Time: u1.Time, Pump: u1.Pump}
	if u1.Time.Hour() == u2.Time.Hour() {
		u.Pump += u2.Pump
		return u, false
	}
	return u2, true
}

func (u1 Usage) Before(ux types.Metric) bool {
	u2 := ux.(Usage)
	return u1.Time.Before(u2.Time)
}
