package controller

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"time"
)

const LightingBucket = "lightings"

type Lighting struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Enabled     bool   `json:"enabled"`
	Channel     int    `json:"channel"`
	Intensities []int  `json:"intensities"`
	stopCh      chan struct{}
	ticker      *time.Ticker
}

func (l *Lighting) Validate() error {
	if len(l.Intensities) != 12 {
		fmt.Errorf("Expect 12 values instead of:", len(l.Intensities))
	}
	for i, v := range l.Intensities {
		if (v < 0) || (v > 100) {
			return fmt.Errorf("Intensity value '", v, "' at posiotion", i, "is out of range (0-99)")
		}
	}
	return nil
}

func (l *Lighting) getCurrentValue(t time.Time) int {
	h1 := (t.Hour() / 2) - 1
	if h1 == -1 {
		h1 = 11
	}
	h2 := h1 + 1
	if h2 >= 12 {
		h2 = 0
	}

	m := t.Minute()
	from := l.Intensities[h1]
	to := l.Intensities[h2]
	f := float64(from) + (((float64(to) - float64(from)) / 120.0) * float64(m))
	return int(math.Ceil(f - 0.5))
}

func (l *Lighting) Start(pwm *PWM) {
	l.ticker = time.NewTicker(time.Minute * 1)
	l.stopCh = make(chan struct{})
	previousValue := -1
	for {
		select {
		case <-l.stopCh:
			l.ticker.Stop()
			l.ticker = nil
			l.stopCh = nil
			return
		case <-l.ticker.C:
			v := l.getCurrentValue(time.Now())
			if v == previousValue {
				log.Println("Skip setting pwm value:", v, "for lighting:", l.Name, "its same as previous")
				continue
			}
			log.Println("Setting pwm value:", v, "for lighting:", l.Name)
			pwm.Set(l.Channel, v)
			previousValue = v
		}
	}
}

func (l *Lighting) Stop() {
	if l.stopCh == nil {
		log.Println("WARNING: stop channel is not initialized.")
		return
	}
	l.stopCh <- struct{}{}
}

func (c *Controller) GetLighting(id string) (Lighting, error) {
	var l Lighting
	return l, c.store.Get(LightingBucket, id, &l)
}

func (c Controller) ListLightings() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var l Lighting
		return &l, json.Unmarshal(v, &l)
	}
	return c.store.List(LightingBucket, fn)
}

func (c *Controller) CreateLighting(l Lighting) error {
	if err := l.Validate(); err != nil {
		return err
	}

	fn := func(id string) interface{} {
		l.ID = id
		return l
	}
	return c.store.Create(LightingBucket, fn)
}

func (c *Controller) UpdateLighting(id string, payload Lighting) error {
	return c.store.Update(LightingBucket, id, payload)
}

func (c *Controller) DeleteLighting(id string) error {
	return c.store.Delete(LightingBucket, id)
}

func (c *Controller) EnableLighting(id string) error {
	if !c.config.EnablePWM {
		return fmt.Errorf("PWM is not enabled")
	}
	l, err := c.GetLighting(id)
	if err != nil {
		return err
	}
	if l.Enabled {
		log.Println("Lighting:", l.Name, "is already enabled")
		return nil
	}
	go l.Start(c.state.pwm)
	l.Enabled = true
	return c.UpdateLighting(l.ID, l)
}

func (c *Controller) DisableLighting(id string) error {
	l, err := c.GetLighting(id)
	if err != nil {
		return err
	}
	if !l.Enabled {
		log.Println("Lighting:", l.Name, "is already disabled")
		return nil
	}
	l.Stop()
	l.Enabled = false
	return c.UpdateLighting(l.ID, l)
}
