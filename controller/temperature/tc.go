package temperature

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type TC struct {
	ID         string        `json:"id"`
	Name       string        `json:"name"`
	Max        float64       `json:"max"`
	Min        float64       `json:"min"`
	Heater     string        `json:"heater"`
	Cooler     string        `json:"cooler"`
	Period     time.Duration `json:"period"`
	Control    bool          `json:"control"`
	Enable     bool          `json:"enable"`
	Notify     Notify        `json:"notify"`
	Sensor     string        `json:"sensor"`
	Fahrenheit bool          `json:"fahrenheit"`
	ChartMin   float64       `json:"chart_min"`
	ChartMax   float64       `json:"chart_max"`
}
type Notify struct {
	Enable bool    `json:"enable"`
	Max    float64 `json:"max"`
	Min    float64 `json:"min"`
}

func (c *Controller) Get(id string) (TC, error) {
	var tc TC
	return tc, c.store.Get(Bucket, id, &tc)
}
func (c Controller) List() ([]TC, error) {
	tcs := []TC{}
	fn := func(v []byte) error {
		var tc TC
		if err := json.Unmarshal(v, &tc); err != nil {
			return err
		}
		tcs = append(tcs, tc)
		return nil
	}
	return tcs, c.store.List(Bucket, fn)
}

func (c *Controller) Create(tc TC) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if tc.Period <= 0 {
		return fmt.Errorf("Check period for temperature controller must be greater than zero")
	}
	fn := func(id string) interface{} {
		tc.ID = id
		return &tc
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	if tc.Enable {
		quit := make(chan struct{})
		c.quitters[tc.ID] = quit
		go c.Run(tc, quit)
	}
	return nil
}

func (c *Controller) Update(id string, tc TC) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	tc.ID = id
	if tc.Period <= 0 {
		return fmt.Errorf("Period should be positive. Supplied:%d", tc.Period)
	}
	if err := c.store.Update(Bucket, id, tc); err != nil {
		return err
	}
	quit, ok := c.quitters[tc.ID]
	if ok {
		close(quit)
		delete(c.quitters, tc.ID)
	}
	if tc.Enable {
		quit := make(chan struct{})
		c.quitters[tc.ID] = quit
		go c.Run(tc, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.store.Delete(Bucket, id); err != nil {
		return err
	}
	if err := c.store.Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  temperature sub-system: Failed to delete usage details for sensor:", id)
	}
	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	return nil
}

func (c *Controller) IsEquipmentInUse(id string) (bool, error) {
	tcs, err := c.List()
	if err != nil {
		return false, err
	}
	for _, tc := range tcs {
		if tc.Heater == id {
			return true, nil
		}
		if tc.Cooler == id {
			return true, nil
		}
	}
	return false, nil
}

func (c *Controller) Run(t TC, quit chan struct{}) {
	if t.Period <= 0 {
		log.Printf("ERROR: temperature sub-system. Invalid period set for sensor:%s. Expected postive, found:%d\n", t.Name, t.Period)
		return
	}
	ticker := time.NewTicker(t.Period * time.Second)
	for {
		select {
		case <-ticker.C:
			c.Check(t)
		case <-quit:
			ticker.Stop()
			return
		}
	}
}
