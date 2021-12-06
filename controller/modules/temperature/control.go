package temperature

import (
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func (c *Controller) Check(tc *TC) (float64, error) {
	if !tc.Enable {
		return 0, nil
	}

	reading, err := c.Read(tc)
	if err != nil {
		log.Println("ERROR: temperature sub-system. Failed to read  sensor. Error:", err)
		c.c.LogError("tc-"+tc.ID, "temperature sub-system. Failed to read  sensor "+tc.Name+". Error:"+err.Error())
		subject := fmt.Sprintf("Temperature sensor '%s' failed", tc.Name)
		c.c.Telemetry().Alert(subject, "Error:"+err.Error())
		return reading, err
	}

	calibrator, exists := c.calibrators[tc.Sensor]
	if exists {
		reading = calibrator.Calibrate(reading)
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
			log.Println("temperature sub-system: ERROR: Failed to execute:", err)
			c.c.LogError("tc-"+tc.ID, "Failed to execute temperature control logic for:"+tc.Name+". Error:"+err.Error())
		}
	}
	c.NotifyIfNeeded(tc, reading)
	c.statsMgr.Update(tc.ID, u)
	resp, err := c.statsMgr.Get(tc.ID)
	if err != nil {
		log.Println("ERROR: temperature-subsystem. Failed to get usage statistics for sensor:", tc.Name, "Error:", err)
		return reading, err
	}
	if len(resp.Historical) < 1 {
		return reading, nil
	}
	m := resp.Historical[len(resp.Historical)-1]
	u, ok := m.(controller.Observation)
	if !ok {
		log.Println("ERROR: temperature-subsystem: failed to convert generic metric to temperature controller usage")
		return reading, nil
	}
	if tc.Heater != "" {
		c.c.Telemetry().EmitMetric(tc.Name, "heater", float64(u.Upper))
	}
	if tc.Cooler != "" {
		c.c.Telemetry().EmitMetric(tc.Name, "cooler", float64(u.Downer))
	}
	return reading, nil
}

func (c *Controller) NotifyIfNeeded(tc *TC, reading float64) {
	if !tc.Notify.Enable {
		return
	}
	format := "Current value (%f) is out of acceptable range ( %f -%f )"
	body := fmt.Sprintf(format, reading, tc.Notify.Min, tc.Notify.Max)
	if reading >= tc.Notify.Max {
		subject := fmt.Sprintf("temperature sensor '%s' is above acceptable range", tc.Name)
		c.c.Telemetry().Alert(subject, body)
		return
	}
	if reading <= tc.Notify.Min {
		subject := fmt.Sprintf("temperature sensor '%s' is below acceptable range", tc.Name)
		c.c.Telemetry().Alert(subject, "Tank is running cold. "+body)
		return
	}
}
