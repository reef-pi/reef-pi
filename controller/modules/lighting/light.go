package lighting

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/pwm_profile"
)

type Light struct {
	ID       string          `json:"id"`
	Name     string          `json:"name"`
	Channels map[int]Channel `json:"channels"`
	Jack     string          `json:"jack"`
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
		ch, ok := l.Channels[pin]
		if !ok {
			ch = Channel{
				Profile: Profile{
					Type:   "fixed",
					Config: []byte(`{"value": 0}`),
				},
			}
		}
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
	for _, ch := range light.Channels {
		spec := pwm_profile.ProfileSpec{
			Name:   ch.Name,
			Type:   ch.Profile.Type,
			Config: ch.Profile.Config,
		}
		p, err := spec.CreateProfile()
		if err != nil {
			log.Println("ERROR:lighting subystem. Profile creation failed for channel:", ch.Name, "light:", light.Name, "Error:", err)
			continue
		}
		v := p.Get(time.Now())
		if (ch.Min > 0) && (v < float64(ch.Min)) {
			log.Printf("Lighting: Calculated value(%f) for channel '%s' is below minimum threshold(%d). Resetting to 1\n", v, ch.Name, ch.Min)
			v = float64(ch.StartMin)
		} else if (ch.Max > 0) && (v > float64(ch.Max)) {
			log.Printf("Lighting: Calculated value(%f) for channel '%s' is above maximum threshold(%d). Resetting to %d\n", v, ch.Name, ch.Max, ch.Max)
			v = float64(ch.Max)
		}
		c.UpdateChannel(light.Jack, ch, v)
		c.c.Telemetry().EmitMetric(light.Name, ch.Name, v)
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
