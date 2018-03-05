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
	Ph     float64        `json:"pH"`
	Time   utils.TeleTime `json:"time"`
	values []float64      `json:"-"`
}

type Readings struct {
	Current    *ring.Ring
	Historical *ring.Ring
}

type ReadingsResponse struct {
	Current    []Measurement `json:"current"`
	Historical []Measurement `json:"historical"`
}

func newReadings() Readings {
	return Readings{
		Current:    ring.New(180),
		Historical: ring.New(24 * 7),
	}
}

const ReadingsBucket = "ph_readings"

func (c *Controller) GetReadings(id string) (ReadingsResponse, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
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
				log.Println("ERROR: ph subsystem. Failed to typecast current ph reading")
				return
			}
			resp.Current = append(resp.Current, m)
		}
	})
	sort.Slice(resp.Current, func(i, j int) bool {
		return resp.Current[i].Time.Before(resp.Current[j].Time)
	})

	readings.Historical.Do(func(i interface{}) {
		if i != nil {
			m, ok := i.(Measurement)
			if !ok {
				log.Println("ERROR: ph subsystem. Failed to typecast historical ph reading")
				return
			}
			resp.Historical = append(resp.Historical, m)
		}
	})
	sort.Slice(resp.Historical, func(i, j int) bool {
		return resp.Historical[i].Time.Before(resp.Historical[j].Time)
	})

	return resp, nil
}

func historicalReadings(h *ring.Ring, r float64) *ring.Ring {
	current := Measurement{
		Time:   utils.TeleTime(time.Now()),
		values: []float64{r},
		Ph:     r,
	}
	if h.Value == nil {
		h.Value = current
		return h
	}
	previous, ok := h.Value.(Measurement)
	if !ok {
		log.Println("ERROR: ph subsystem. Failed to typecast previous ph reading")
		return h
	}
	if previous.Time.Hour() == current.Time.Hour() {
		current.values = append(previous.values, r)
		total := float64(0.0)
		for _, v := range current.values {
			total += v
		}
		current.Ph = total / float64(len(current.values))
		return h
	}
	h = h.Next()
	h.Value = current
	return h
}

func (c *Controller) updateReadings(id string, v float64) {
	c.mu.Lock()
	readings, ok := c.readings[id]
	c.mu.Unlock()
	if !ok {
		readings = newReadings()
	}
	m := Measurement{
		Ph:   v,
		Time: utils.TeleTime(time.Now()),
	}
	readings.Current.Value = m
	readings.Current = readings.Current.Next()

	h := historicalReadings(readings.Historical, v)
	readings.Historical = h
	c.mu.Lock()
	c.readings[id] = readings
	c.mu.Unlock()

}

func notifyIfNeeded(t *utils.Telemetry, name string, n Notify, reading float64) {
	if !n.Enable {
		return
	}
	subject := "[Reef-Pi ALERT] ph out of range"
	format := "Current ph value from probe '%s' (%f) is out of acceptable range ( %f -%f )"
	body := fmt.Sprintf(format, reading, name, n.Min, n.Max)
	if reading >= n.Max {
		t.Alert(subject, "Tank ph is high. "+body)
		return
	}
	if reading <= n.Min {
		t.Alert(subject, "Tank ph is low. "+body)
		return
	}
}

func (c *Controller) loadReadings(id string) {
	var resp ReadingsResponse
	if err := c.store.Get(ReadingsBucket, id, &resp); err != nil {
		log.Println("ERROR: ph sub-system failed to restore usage statistics from db. Error:", err)
		return
	}
	readings := newReadings()
	for _, m := range resp.Current {
		readings.Current.Value = m
		readings.Current = readings.Current.Next()
	}
	for _, m := range resp.Historical {
		readings.Historical.Value = m
		readings.Historical = readings.Historical.Next()
	}
	c.mu.Lock()
	c.readings[id] = readings
	c.mu.Unlock()
}

func (c *Controller) saveReadings(id string) {
	readings, err := c.GetReadings(id)
	if err != nil {
		log.Println("ERROR: ph sub-system failed to fetch . Error:", err)
		return
	}
	if err := c.store.Update(ReadingsBucket, id, readings); err != nil {
		log.Println("ERROR: ph sub-system failed to save readings in db. Error:", err)
	}
}
