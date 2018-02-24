package ph

import (
	"container/ring"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sort"
	"time"
)

type Measurement struct {
	Ph   float64
	Time utils.TeleTime
}

type Readings struct {
	Current    *ring.Ring
	Historical *ring.Ring
}

type ReadingsResponse struct {
	Current    []Measurement
	Historical []Measurement
}

func newReadings() Readings {
	return Readings{
		Current:    ring.New(180),
		Historical: ring.New(24 * 7),
	}
}

const ReadingsBucket = "ph_readings"

func (c *Controller) GetReadings(id string) (ReadingsResponse, error) {
	resp := ReadingsResponse{
		Current:    []Measurement{},
		Historical: []Measurement{},
	}
	readings, ok := c.readings[id]
	if !ok {
		return resp, fmt.Errorf("readings not found")
	}
	readings.Current.Do(func(i interface{}) {
		if i != nil {
			m, ok := i.(Measurement)
			if !ok {
				log.Println("ERROR: ph subsystem. Failed to typecast temperature reading")
				return
			}
			resp.Current = append(resp.Current, m)
		}
	})
	sort.Slice(resp.Current, func(i, j int) bool {
		return resp.Current[i].Time.Before(resp.Current[j].Time)
	})

	return resp, nil
}

func (c *Controller) updateReadings(id string, v float64) {
	readings, ok := c.readings[id]
	if !ok {
		readings = newReadings()
	}
	m := Measurement{
		Ph:   v,
		Time: utils.TeleTime(time.Now()),
	}
	readings.Current.Value = m
	readings.Current = readings.Current.Next()
	c.readings[id] = readings
	log.Println("Updated readings")
}
