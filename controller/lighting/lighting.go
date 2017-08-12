package lighting

import (
	"log"
	"time"
)

func (c *Controller) Start() {
	ticker := time.NewTicker(c.config.Interval)
	log.Println("Starting lighting cycle")
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

func (c *Controller) Stop() {
	if c.stopCh == nil {
		log.Println("WARNING: stop channel is not initialized.")
		return
	}
	c.stopCh <- struct{}{}
	log.Println("Stopped lighting cycle")
}

func (c *Controller) UpdateChannel(chName string, v int) {
	pin := c.config.Channels[chName].Pin
	log.Println("Setting pwm value:", v, " at pin:", pin)
	c.pwm.Set(pin, v)
}

func (c *Controller) Reconfigure() {
	if c.config.Cycle.Enable {
		go c.Start()
		return
	}
	for chName, v := range c.config.Fixed {
		c.UpdateChannel(chName, v)
	}
	return
}
