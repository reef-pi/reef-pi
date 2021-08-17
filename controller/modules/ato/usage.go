package ato

import (
	"fmt"
	"log"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Usage struct {
	Pump int                `json:"pump"`
	Time telemetry.TeleTime `json:"time"`
}

func (u1 Usage) Rollup(ux telemetry.Metric) (telemetry.Metric, bool) {
	u2 := ux.(Usage)
	u := Usage{Time: u1.Time, Pump: u1.Pump}
	if u1.Time.Hour() == u2.Time.Hour() {
		u.Pump += u2.Pump
		return u, false
	}
	return u2, true
}

func (u1 Usage) Before(ux telemetry.Metric) bool {
	u2 := ux.(Usage)
	return u1.Time.Before(u2.Time)
}

func (c *Controller) NotifyIfNeeded(a ATO) {
	resp, err := c.statsMgr.Get(a.ID)
	if err != nil {
		log.Println("ERROR: ato-subsystem. Failed to get usage statistics for ato:", a.Name, "Error:", err)
		return
	}
	if len(resp.Historical) < 1 {
		return
	}

	m := resp.Historical[len(resp.Historical)-1]
	u, ok := m.(Usage)
	if !ok {
		log.Println("ERROR: ato-subsystem: failed to convert generic metric to ato usage")
		return
	}
	c.c.Telemetry().EmitMetric("ato", a.Name+"-usage", float64(u.Pump))
	log.Println("ato-subsystem: sensor:", a.Name, " usage:", float64(u.Pump))
	if !a.Notify.Enable {
		return
	}
	if u.Pump >= a.Notify.Max {
		log.Println("WARNING: ato-subsystem: ATO '", a.Name, "' usage is higher than threshold. Sending alert")
		subject := fmt.Sprintf("'%s' usage is out of range", a.Name)
		format := "Current usage(%d) of '%s' is above acceptable value (%d)"
		body := fmt.Sprintf(format, u.Pump, a.Name, a.Notify.Max)
		c.c.Telemetry().Alert(subject, body)
		if a.DisableOnAlert {
			log.Println("WARNING: ato-subsystem: ATO '", a.Name, "' usage is higher than threshold. Disabling ATO")
			sub, err := c.sub(a)
			if err != nil {
				log.Println("ERROR:ato-subsystem: Failed to get target subsystem:", a.ID, "Error:", err)
			}
			if err := sub.On(a.Pump, false); err != nil {
				log.Println("ERROR:ato-subsystem: Failed to get switch off target", a.ID, "Error:", err)
			}
			a.Enable = false
			if err := c.Update(a.ID, a); err != nil {
				log.Println("ERROR:ato-subsystem: Failed to disable ato:", a.ID, "Error:", err)
			}
		}
	}
}
