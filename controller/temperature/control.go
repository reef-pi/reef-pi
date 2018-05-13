package temperature

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
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

func (u1 Usage) Rollup(ux utils.Metric) (utils.Metric, bool) {
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

func (u1 Usage) Before(u2 utils.Metric) bool {
	return u1.Time.Before(u2.(Usage).Time)
}

func (c *Controller) Check(tc TC) {
	if !tc.Enable {
		return
	}
	u := Usage{
		Time: utils.TeleTime(time.Now()),
	}
	reading, err := c.Read(tc)
	if err != nil {
		log.Println("ERROR: temperature sub-system. Failed to read  sensor. Error:", err)
		return
	}
	u.Temperature = reading
	log.Println("temperature sub-system:  sensor", tc.Name, "value:", reading)
	if tc.Control {
		if err := c.control(tc, &u); err != nil {
			log.Println("ERROR: Failed to execute temperature control logic. Error:", err)
		}
	}
	c.NotifyIfNeeded(tc, reading)
	c.statsMgr.Update(tc.ID, u)
}

func (c *Controller) control(tc TC, u *Usage) error {
	switch {
	case u.Temperature > tc.Max:
		log.Println("Current temperature is above maximum threshold. Executing cool down routine")
		u.Cooler += int(tc.Period)
		return c.coolDown(tc)
	case u.Temperature < tc.Min:
		log.Println("Current temperature is below minimum threshold. Executing warm up routine")
		u.Heater += int(tc.Period)
		return c.warmUp(tc)
	default:
		c.switchOffAll(tc)
	}
	return nil
}

func (c *Controller) warmUp(tc TC) error {
	if tc.Cooler != "" {
		if err := c.equipments.Control(tc.Cooler, false); err != nil {
			return err
		}
	}
	if tc.Heater != "" {
		if err := c.equipments.Control(tc.Heater, true); err != nil {
			return err
		}
	}
	return nil
}

func (c *Controller) coolDown(tc TC) error {
	if tc.Heater != "" {
		if err := c.equipments.Control(tc.Heater, false); err != nil {
			return err
		}
	}
	if tc.Cooler != "" {
		if err := c.equipments.Control(tc.Cooler, true); err != nil {
			return err
		}
	}
	return nil
}

func (c *Controller) switchOffAll(tc TC) {
	if tc.Heater != "" {
		c.equipments.Control(tc.Heater, false)
	}
	if tc.Cooler != "" {
		c.equipments.Control(tc.Heater, false)
	}
}

func (c *Controller) NotifyIfNeeded(tc TC, reading float64) {
	if !tc.Notify.Enable {
		return
	}
	subject := fmt.Sprintf("[Reef-Pi ALERT] temperature of '%s' out of range", tc.Name)
	format := "Current temperature (%f) is out of acceptable range ( %f -%f )"
	body := fmt.Sprintf(format, reading, tc.Notify.Min, tc.Notify.Max)
	if reading >= tc.Notify.Max {
		c.telemetry.Alert(subject, "Tank is running hot."+body)
		return
	}
	if reading <= tc.Notify.Min {
		c.telemetry.Alert(subject, "Tank is running cold. "+body)
		return
	}
}
