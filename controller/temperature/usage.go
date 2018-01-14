package temperature

import (
	"log"
	"sort"
)

func (c *Controller) GetReadings() ([]Measurement, error) {
	readings := []Measurement{}
	c.readings.Do(func(i interface{}) {
		if i != nil {
			m, ok := i.(Measurement)
			if !ok {
				log.Println("ERROR: temperature subsystem. Failed to typecast temperature reading")
				return
			}
			readings = append(readings, m)
		}
	})
	sort.Slice(readings, func(i, j int) bool {
		return readings[i].Time.Before(readings[j].Time)
	})
	return readings, nil
}

func (c *Controller) loadReadings() {
	var readings []Measurement
	if err := c.store.Get(Bucket, "readings", &readings); err != nil {
		log.Println("ERROR: temperature sub-system failed to restore readings from db. Error:", err)
	}
	for _, r := range readings {
		c.readings.Value = r
		c.readings = c.readings.Next()
	}
}

func (c *Controller) saveReadings() {
	readings, err := c.GetReadings()
	if err != nil {
		log.Println("ERROR: temperature sub-system failed to fetch readings. Error:", err)
		return
	}
	if err := c.store.Update(Bucket, "readings", readings); err != nil {
		log.Println("ERROR: temperature sub-system failed to save readings in db. Error:", err)
	}
}

func (c *Controller) loadUsage() {
	var usage []Usage
	if err := c.store.Get(Bucket, "usage", &usage); err != nil {
		log.Println("ERROR: temperature sub-system failed to restore usage statistics from db. Error:", err)
	}
	for _, u := range usage {
		c.usage.Value = u
		c.usage = c.usage.Next()
	}
}

func (c *Controller) saveUsage() {
	usage, err := c.GetUsage()
	if err != nil {
		log.Println("ERROR: temperature sub-system failed to fetch usage statistic. Error:", err)
		return
	}
	if err := c.store.Update(Bucket, "usage", usage); err != nil {
		log.Println("ERROR: temperature sub-system failed to save usage statistics in db. Error:", err)
	}
}

func (c *Controller) GetUsage() ([]Usage, error) {
	usage := []Usage{}
	c.usage.Do(func(i interface{}) {
		if i != nil {
			u, ok := i.(Usage)
			if !ok {
				log.Println("ERROR: temperature subsystem. Failed to typecast temperature controller usage")
				return
			}
			usage = append(usage, u)
		}
	})
	sort.Slice(usage, func(i, j int) bool {
		return usage[i].Time.Before(usage[j].Time)
	})
	return usage, nil
}
