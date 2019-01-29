package ph

import (
	"fmt"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const ReadingsBucket = "ph_readings"

type Measurement struct {
	Ph   float64            `json:"pH"`
	Time telemetry.TeleTime `json:"time"`
	sum  float64
	len  int
}

func (m1 Measurement) Rollup(mx telemetry.Metric) (telemetry.Metric, bool) {
	m2 := mx.(Measurement)
	m := Measurement{Time: m1.Time, Ph: m1.Ph, sum: m1.sum, len: m1.len}
	if m1.Time.Hour() == m2.Time.Hour() {
		m.sum += m2.Ph
		m.len += 1
		m.Ph = telemetry.TwoDecimal(m.sum / float64(m.len))
		return m, false
	}
	return m2, true
}

func (m1 Measurement) Before(mx telemetry.Metric) bool {
	m2 := mx.(Measurement)
	return m1.Time.Before(m2.Time)
}

func notifyIfNeeded(t telemetry.Telemetry, p Probe, reading float64) {
	if !p.Notify.Enable {
		return
	}
	subject := fmt.Sprintf("[Reef-Pi ALERT] ph of '%s' out of range", p.Name)
	format := "Current ph value from probe '%s' (%f) is out of acceptable range ( %f -%f )"
	body := fmt.Sprintf(format, reading, p.Name, p.Notify.Min, p.Notify.Max)
	if reading >= p.Notify.Max {
		t.Alert(subject, "Tank ph is high. "+body)
		return
	}
	if reading <= p.Notify.Min {
		t.Alert(subject, "Tank ph is low. "+body)
		return
	}
}
