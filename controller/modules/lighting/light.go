package lighting

import (
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type Light struct {
	ID       string           `json:"id"`
	Name     string           `json:"name"`
	Channels map[int]*Channel `json:"channels"`
	Jack     string           `json:"jack"`
	Enable   bool             `json:"enable"`
}

func (l *Light) LoadChannels() {
	for _, ch := range l.Channels {
		if !ch.Manual {
			ch.loadProfile()
		}
	}
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

func (c *Controller) validate(l *Light) error {
	if l.Name == "" {
		return fmt.Errorf("Light name can not be empty")
	}
	j, err := c.jacks.Get(l.Jack)
	if err != nil {
		return fmt.Errorf("Non existent jack: '%s'. Error: %s", l.Jack, err.Error())
	}
	if l.Channels == nil {
		l.Channels = make(map[int]*Channel)
	}
	for i, pin := range j.Pins {
		ch, ok := l.Channels[pin]
		if !ok {
			ch = new(Channel)
		}
		ch.Pin = pin
		if ch.Name == "" {
			ch.Name = fmt.Sprintf("channel-%d", i+1)
		}
		if ch.ProfileSpec.Type == "" {
			ch.Manual = true
		}
		if err := ch.loadProfile(); err != nil {
			log.Println("ERROR: lighting-subsystenL failed to load profile for channel", ch.Name, "light", l.Name, "Error:", err)
		}
		if ch.Max == 0 {
			ch.Max = 100
		}
		l.Channels[pin] = ch
	}
	l.LoadChannels()
	return nil
}

func (c *Controller) Create(l Light) error {
	if err := c.validate(&l); err != nil {
		return err
	}
	fn := func(id string) interface{} {
		l.ID = id
		return &l
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return nil
	}
	c.Lock()
	c.lights[l.ID] = &l
	c.Unlock()
	for _, ch := range l.Channels {
		c.c.Telemetry().CreateFeedIfNotExist(l.Name + "-" + ch.Name)
	}
	return nil
}

func (c *Controller) Update(id string, l Light) error {
	l.ID = id
	if err := c.validate(&l); err != nil {
		return err
	}
	if err := c.c.Store().Update(Bucket, id, l); err != nil {
		return err
	}
	c.Lock()
	c.lights[l.ID] = &l
	c.Unlock()
	if l.Enable {
		c.syncLight(&l)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	if err := c.c.Store().Delete(Bucket, id); err != nil {
		return err
	}
	c.Lock()
	delete(c.lights, id)
	c.Unlock()
	return nil
}

func (c *Controller) syncLight(light *Light) {
	for _, ch := range light.Channels {
		v, err := ch.ValueAt(time.Now())
		if err != nil {
			log.Println("ERROR: lighting subsystem. Profile value computation error. Light:", light.Name, "channel:", ch.Name, "Error:", err)
		}
		log.Println("lighting subsystem: Setting Light: ", light.Name, "Channel:", ch.Name, "Value:", v)
		c.UpdateChannel(light.Jack, *ch, v)
		c.c.Telemetry().EmitMetric(light.Name, ch.Name, v)
	}
}
