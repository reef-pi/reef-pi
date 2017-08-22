package lighting

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
)

const Bucket = "lightings"

type Light struct {
	ID       string          `json:"id" yaml:"id"`
	Name     string          `json:"name" yaml:"name"`
	Enable   bool            `json:"enable" yaml:"enable"`
	Channels map[int]Channel `json:"channels" yaml:"channels"`
	Jack     string          `json:"jack" yaml:"jack"`
}

var DefaultLight = Light{
	Channels: make(map[int]Channel),
}

type Controller struct {
	store     utils.Store
	pwm       *utils.PWM
	stopCh    chan struct{}
	telemetry *utils.Telemetry
	config    Config
	running   bool
	mu        *sync.Mutex
}

func New(conf Config, store utils.Store, telemetry *utils.Telemetry) *Controller {
	return &Controller{
		telemetry: telemetry,
		store:     store,
		config:    conf,
		stopCh:    make(chan struct{}),
		mu:        &sync.Mutex{},
	}
}

func (c *Controller) Start() {
	if c.config.Enable {
		go c.StartCycle()
		return
	}
}
func (c *Controller) Stop() {
	if c.config.Enable {
		c.StopCycle()
		return
	}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}

func (c *Controller) Get(id string) (Light, error) {
	var l Light
	return l, c.store.Get(Bucket, id, &l)
}
func (c Controller) Jacks() ([]Jack, error) {
	var jacks []Jack
	for name, j := range c.config.Jacks {
		j.Name = name
		jacks = append(jacks, j)
	}
	return jacks, nil
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
	return ls, c.store.List(Bucket, fn)
}

func (c *Controller) Create(l Light) error {
	if l.Name == "" {
		return fmt.Errorf("Light name can not be empty")
	}
	j, ok := c.config.Jacks[l.Jack]
	if !ok {
		return fmt.Errorf("Non existent jack: '%s'", l.Jack)
	}
	if l.Channels == nil {
		l.Channels = make(map[int]Channel)
	}
	for i, pin := range j.Pins {
		ch, ok := l.Channels[pin]
		if !ok {
			ch = Channel{Ticks: 12}
		}
		if ch.Ticks != 12 {
			log.Println("Warn: Only 12 ticks are supported. Ignoring ticks:", ch.Ticks)
			ch.Ticks = 12
		}
		if ch.Name == "" {
			ch.Name = fmt.Sprintf("Channel-%d", i+1)
		}
		ch.Pin = pin
		if ch.MaxThreshold == 0 {
			ch.MaxThreshold = 100
		}
		if ch.Values == nil {
			ch.Values = make([]int, ch.Ticks)
		}
		l.Channels[pin] = ch
	}
	fn := func(id string) interface{} {
		l.ID = id
		return &l
	}
	return c.store.Create(Bucket, fn)
}

func (c *Controller) Update(id string, l Light) error {
	l.ID = id
	return c.store.Update(Bucket, id, l)
}

func (c *Controller) Delete(id string) error {
	_, err := c.Get(id)
	if err != nil {
		return err
	}
	return c.store.Delete(Bucket, id)
}
