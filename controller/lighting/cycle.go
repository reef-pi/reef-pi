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
		log.Println("ERROR: lighting sub-system:  Failed to list lights. Error:", err)
		return
	}
	for _, light := range lights {
		c.syncLight(light)
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

func (c *Controller) UpdateChannel(jack string, ch Channel, v int) {
	if ch.Reverse {
		v = 100 - v
	}
	log.Println("lighting-subsystem: Setting PWM value:", v, " at channel:", ch.Pin)
	pv := make(map[int]int)
	pv[ch.Pin] = v
	if err := c.jacks.Control(jack, pv); err != nil {
		log.Println("ERROR: lighting-subsystem: Failed to set pwm value. Error:", err)
	}
}
