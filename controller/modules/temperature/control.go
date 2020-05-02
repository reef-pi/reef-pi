package temperature

import (
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func (c *Controller) Check(tc *TC) {
	if !tc.Enable {
		return
	}

	reading, err := c.Read(*tc)
	if err != nil {
		log.Println("ERROR: temperature sub-system. Failed to read  sensor. Error:", err)
		c.c.LogError("tc-"+tc.ID, "temperature sub-system. Failed to read  sensor "+tc.Name+". Error:"+err.Error())
		subject := fmt.Sprintf("Temperature sensor '%s' failed", tc.Name)
		c.c.Telemetry().Alert(subject, "Temperature sensor failure. Error:"+err.Error())
		return
	}
	if tc.calibrator != nil {
		reading = tc.calibrator.Calibrate(reading)
	}
	tc.currentValue = reading
	log.Println("temperature sub-system:  sensor", tc.Name, "value:", reading)
	c.c.Telemetry().EmitMetric(tc.Name, "reading", reading)
	u := controller.Observation{
		Time:  telemetry.TeleTime(time.Now()),
		Value: reading,
	}
	if tc.Control {
		if err := tc.h.Sync(&u); err != nil {
			log.Println("ERROR: Failed to execute temperature control logic. Error:", err)
		}
	}
	c.NotifyIfNeeded(*tc, reading)
	c.statsMgr.Update(tc.ID, u)
	resp, err := c.statsMgr.Get(tc.ID)
	if err != nil {
		log.Println("ERROR: temperature-subsystem. Failed to get usage statistics for sensor:", tc.Name, "Error:", err)
		return
	}
	if len(resp.Historical) < 1 {
		return
	}
	m := resp.Historical[len(resp.Historical)-1]
	u, ok := m.(controller.Observation)
	if !ok {
		log.Println("ERROR: temperature-subsystem: failed to convert generic metric to temperature controller usage")
		return
	}
	c.c.Telemetry().EmitMetric("tc_", tc.Name+"_heater", float64(u.Upper))
	c.c.Telemetry().EmitMetric("tc_", tc.Name+"_cooler", float64(u.Upper))
}

func (c *Controller) NotifyIfNeeded(tc TC, reading float64) {
	if !tc.Notify.Enable {
		return
	}
	subject := fmt.Sprintf("[Reef-Pi ALERT] temperature of '%s' out of range", tc.Name)
	format := "Current temperature (%f) is out of acceptable range ( %f -%f )"
	body := fmt.Sprintf(format, reading, tc.Notify.Min, tc.Notify.Max)
	if reading >= tc.Notify.Max {
		c.c.Telemetry().Alert(subject, "Tank is running hot."+body)
		return
	}
	if reading <= tc.Notify.Min {
		c.c.Telemetry().Alert(subject, "Tank is running cold. "+body)
		return
	}
}
