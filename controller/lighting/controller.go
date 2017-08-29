package lighting

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
	"time"
)

const Bucket = "lightings"

type Light struct {
	ID       string          `json:"id" yaml:"id"`
	Name     string          `json:"name" yaml:"name"`
	Enable   bool            `json:"enable" yaml:"enable"`
	Channels map[int]Channel `json:"channels" yaml:"channels"`
	Jack     string          `json:"jack" yaml:"jack"`
}

type Controller struct {
	store     utils.Store
	jacks     *connectors.Jacks
	pwm       *utils.PWM
	stopCh    chan struct{}
	telemetry *utils.Telemetry
	config    Config
	running   bool
	mu        *sync.Mutex
}

func New(conf Config, jacks *connectors.Jacks, store utils.Store, telemetry *utils.Telemetry) (*Controller, error) {
	pwmConf := utils.DefaultPWMConfig
	pwmConf.DevMode = conf.DevMode
	pwm, err := utils.NewPWM(pwmConf)
	if err != nil {
		return nil, err
	}
	return &Controller{
		telemetry: telemetry,
		store:     store,
		jacks:     jacks,
		config:    conf,
		stopCh:    make(chan struct{}),
		mu:        &sync.Mutex{},
		pwm:       pwm,
	}, nil
}

func (c *Controller) Start() {
	go c.StartCycle()
}

func (c *Controller) Stop() {
	c.StopCycle()
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}

func (c *Controller) Get(id string) (Light, error) {
	var l Light
	return l, c.store.Get(Bucket, id, &l)
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
	if err := c.store.Update(Bucket, id, l); err != nil {
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
	return c.store.Delete(Bucket, id)
}

func (c *Controller) syncLight(light Light) {
	for _, ch := range light.Channels {
		if !ch.Auto {
			c.UpdateChannel(ch, ch.Fixed)
			c.telemetry.EmitMetric(ch.Name, ch.Fixed)
			return
		}
		expectedValues := ch.Values // TODO implement ticks`
		v := GetCurrentValue(time.Now(), expectedValues)
		if (ch.MinTheshold > 0) && (v < ch.MinTheshold) {
			log.Printf("Lighting: Calculated value(%d) for channel '%s' is below minimum threshold(%d). Resetting to 0\n", v, ch.Name, ch.MinTheshold)
			v = 0
		} else if (ch.MaxThreshold > 0) && (v > ch.MaxThreshold) {
			log.Printf("Lighting: Calculated value(%d) for channel '%s' is above maximum threshold(%d). Resetting to %d\n", v, ch.Name, ch.MaxThreshold, ch.MaxThreshold)
			v = ch.MaxThreshold
		}
		c.UpdateChannel(ch, v)
		c.telemetry.EmitMetric(ch.Name, v)
	}
}
