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

func (c *Controller) StartCycle() {
	ticker := time.NewTicker(c.config.Interval)
	log.Println("Starting lighting cycle")
	c.mu.Lock()
	c.running = true
	c.mu.Unlock()
	for {
		select {
		case <-c.stopCh:
			ticker.Stop()
			return
		case <-ticker.C:
			c.syncLights()
		}
	}
}

func (c *Controller) syncLights() {
	lights, err := c.List()
	if err != nil {
		log.Println("Lighting sub-system ERROR: Failed to list lights. Error:", err)
		return
	}
	for _, light := range lights {
		for pin, ch := range light.Channels {
			if !ch.Auto {
				continue
			}
			expectedValues := ch.Values // TODO implement ticks`
			v := GetCurrentValue(time.Now(), expectedValues)
			if (ch.MinTheshold > 0) && (v < ch.MinTheshold) {
				log.Printf("Lighting: Calculated value(%d) for channel '%s' is below minimum threshold(%d). Resetting to 0\n", v, ch.Name, ch.MinTheshold)
				v = 0
			} else if (ch.MaxThreshold > 0) && (v > ch.MaxThreshold) {
				log.Printf("Lighting: Calculated value(%d) for channel '%s' is above maximum threshold(%d). Resetting to %d\n", v, ch.Name, ch.MaxThreshold, ch.MaxThreshold)
				v = ch.MaxThreshold
			}
			c.UpdateChannel(pin, v)
			c.telemetry.EmitMetric(ch.Name, v)
		}
	}
}

func (c *Controller) StopCycle() {
	c.mu.Lock()
	if !c.running {
		log.Println("lighting subsystem: controller is not running.")
		return
	}
	c.mu.Unlock()
	c.stopCh <- struct{}{}
	c.running = false
	log.Println("Stopped lighting cycle")
}

func (c *Controller) UpdateChannel(pin, v int) {
	if c.config.DevMode {
		log.Println("Lighting sub-system: skipping pwm setting due to dev mode.")
		return
	}
	log.Println("Setting pwm value:", v, " at pin:", pin)
	c.pwm.Set(pin, v)
}
