package lighting

import (
	"fmt"
	"log"
	"time"
)

func ValidateValues(values []int) error {
	if len(values) != 12 {
		return fmt.Errorf("Expect 12 values instead of: %d", len(values))
	}
	for i, v := range values {
		if (v < 0) || (v > 100) {
			return fmt.Errorf(" value %d on index %d is out of range (0-99)", v, i)
		}
	}
	return nil
}

func GetCurrentValue(t time.Time, series []int) int {
	h1 := t.Hour() / 2
	h2 := h1 + 1
	if h2 >= 12 {
		h2 = 0
	}
	m := float64(t.Minute() + ((t.Hour() % 2) * 60))
	from := float64(series[h1])
	to := float64(series[h2])
	f := from + ((to - from) / 120.0 * m)
	fmt.Println("h1:", h1, "h2:", h2, "from:", from, "to:", to, "m:", m, "f:", f)
	return int(f)
}

func (c *Controller) GetCycle() (Cycle, error) {
	var config Config
	return config.Cycle, c.store.Get(Bucket, "config", &config)
}

func (c *Controller) SetCycle(conf Cycle) error {
	var config Config
	if err := c.store.Get(Bucket, "config", &config); err != nil {
		log.Println("ERROR: failed to get lighting config, using default config")
	}
	c.Stop()
	config.Cycle = conf
	if config.Cycle.Enable {
		go c.Start()
	}
	return c.store.Update(Bucket, "config", config)
}

func (c *Controller) StartCycle() {
	ticker := time.NewTicker(c.config.Interval)
	log.Println("Starting lighting cycle")
	c.running = true
	for {
		select {
		case <-c.stopCh:
			ticker.Stop()
			return
		case <-ticker.C:
			for chName, ch := range c.config.Channels {
				expectedValues, ok := c.config.Cycle.ChannelValues[chName]
				if !ok {
					log.Printf("ERROR: Could not find channel '%s' 24 hour cycle values\n", chName)
					continue
				}
				v := GetCurrentValue(time.Now(), expectedValues)
				if (ch.MinTheshold > 0) && (v < ch.MinTheshold) {
					log.Printf("Lighting: Calculated value(%d) for channel '%s' is below minimum threshold(%d). Resetting to 0\n", v, chName, ch.MinTheshold)
					v = 0
				} else if (ch.MaxThreshold > 0) && (v > ch.MaxThreshold) {
					log.Printf("Lighting: Calculated value(%d) for channel '%s' is above maximum threshold(%d). Resetting to %d\n", v, chName, ch.MaxThreshold, ch.MaxThreshold)
					v = ch.MaxThreshold
				}
				c.UpdateChannel(chName, v)
				c.telemetry.EmitMetric(chName, v)
			}
		}
	}
}

func (c *Controller) StopCycle() {
	if !c.running {
		log.Println("lighting subsystem: controller is not running.")
		return
	}
	c.stopCh <- struct{}{}
	c.running = false
	log.Println("Stopped lighting cycle")
}

func (c *Controller) UpdateChannel(chName string, v int) {
	pin := c.config.Channels[chName].Pin
	if c.config.DevMode {
		log.Println("Lighting sub-system: skipping pwm setting due to dev mode.")
		return
	}
	log.Println("Setting pwm value:", v, " at pin:", pin)
	c.pwm.Set(pin, v)
}

func (c *Controller) Reconfigure() {
	if c.config.Cycle.Enable {
		log.Println("Lighting subsystem: cycle controller started")
		go c.Start()
		log.Println("Lighting subsystem: cycle controller startedx")
		return
	}
	for chName, v := range c.config.Fixed {
		c.UpdateChannel(chName, v)
		log.Println("Lighting subsystem: Chennl ", chName, " value:", v)
	}
	log.Println("Lighting subsystem reconfigured")
	return
}
