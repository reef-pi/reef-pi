package temperature

import (
	"github.com/reef-pi/reef-pi/controller/telemetry"

	"github.com/reef-pi/reef-pi/controller/utils"
)

type Measurement struct {
	Time        utils.TeleTime `json:"time"`
	Temperature float64        `json:"temperature"`
}

type Usage struct {
	Heater      int            `json:"heater"`
	Cooler      int            `json:"cooler"`
	Time        utils.TeleTime `json:"time"`
	Temperature float64        `json:"temperature"`
	total       float64
	len         int
}

func (u1 Usage) Rollup(ux telemetry.Metric) (telemetry.Metric, bool) {
	u2 := ux.(Usage)
	u := Usage{
		Heater:      u1.Heater,
		Cooler:      u1.Cooler,
		Time:        u1.Time,
		Temperature: u1.Temperature,
		total:       u1.total,
		len:         u1.len,
	}
	if u.Time.Hour() == u2.Time.Hour() {
		u.Heater += u2.Heater
		u.Cooler += u2.Cooler
		u.total += u2.Temperature
		u.len += 1
		u.Temperature = utils.TwoDecimal(u.total / float64(u.len))
		return u, false
	}
	return u2, true
}

func (u1 Usage) Before(u2 telemetry.Metric) bool {
	return u1.Time.Before(u2.(Usage).Time)
}
