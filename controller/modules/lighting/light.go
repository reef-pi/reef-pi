package lighting

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type Light struct {
	ID       string          `json:"id"`
	Name     string          `json:"name"`
	Channels map[int]Channel `json:"channels"`
	Jack     string          `json:"jack"`
	Enable   bool            `json:"enable"`
}

func (c *Controller) Get(id string) (Light, error) {
	var l Light
	return l, c.c.Store().Get(Bucket, id, &l)
}

func (c Controller) List() ([]Light, error) {
	ls := []Light{}
	fn := func(v []byte) error {
		var l Light
		if err := json.Unmarshal(v, &l); err != nil {
			return err
		}
		ls = append(ls, l)
		return nil
	}
	return ls, c.c.Store().List(Bucket, fn)
}

func (c *Controller) Create(l Light) error {
	if l.Name == "" {
		return fmt.Errorf("Light name can not be empty")
	}
	j, err := c.jacks.Get(l.Jack)
	if err != nil {
		return fmt.Errorf("Non existent jack: '%s'. Error: %s", l.Jack, err.Error())
	}
	if l.Channels == nil {
		l.Channels = make(map[int]Channel)
	}
	for i, pin := range j.Pins {
		ch := l.Channels[pin]
		ch.Pin = pin
		if ch.Name == "" {
			ch.Name = fmt.Sprintf("channel-%d", i+1)
		}
		if ch.Max == 0 {
			ch.Max = 100
		}
		l.Channels[pin] = ch
	}
	fn := func(id string) interface{} {
		l.ID = id
		return &l
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return nil
	}
	for _, ch := range l.Channels {
		c.c.Telemetry().CreateFeedIfNotExist(l.Name + "-" + ch.Name)
	}
	return nil
}

func (c *Controller) Update(id string, l Light) error {
	l.ID = id
	if err := c.c.Store().Update(Bucket, id, l); err != nil {
		return err
	}
	c.syncLight(l)
	return nil
}

func (c *Controller) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	return c.c.Store().Delete(Bucket, id)
}

func (c *Controller) syncLight(light Light) {
	if !light.Enable {
		return
	}
	for _, ch := range light.Channels {
		v, err := c.ProfileValue(ch, time.Now())
		if err != nil {
			log.Println("ERROR: lighting subsystem. Profile value computation error. Light:", light.Name, "channel:", ch.Name, "Error:", err)
		}
		c.UpdateChannel(light.Jack, ch, v)
		c.c.Telemetry().EmitMetric(light.Name, ch.Name, v)
	}
}
