package lighting

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"log"
	"sync"
	"time"
)

const Bucket = storage.LightingBucket

type Config struct {
	DevMode  bool          `json:"dev_mode"`
	Interval time.Duration `json:"interval"`
}

var DefaultConfig = Config{
	Interval: 15 * time.Second,
}

type Controller struct {
	sync.Mutex
	jacks   *connectors.Jacks
	stopCh  chan struct{}
	config  Config
	running bool
	c       controller.Controller
	lights  map[string]*Light
}

func New(conf Config, c controller.Controller) (*Controller, error) {
	return &Controller{
		Mutex:  sync.Mutex{},
		c:      c,
		jacks:  c.DM().Jacks(),
		config: conf,
		stopCh: make(chan struct{}),
		lights: make(map[string]*Light),
	}, nil
}

func (c *Controller) Start() {
	go c.StartCycle()
}
func (c *Controller) StartCycle() {
	ticker := time.NewTicker(c.config.Interval)
	c.syncLights()
	for {
		select {
		case <-c.stopCh:
			ticker.Stop()
			return
		case <-ticker.C:
			c.syncLights()
		}
	}
}

func (c *Controller) Stop() {
	c.stopCh <- struct{}{}
	log.Println("Stopped lighting cycle")
}

func (c *Controller) Setup() error {
	c.Lock()
	defer c.Unlock()
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	lights, err := c.List()
	if err != nil {
		return err
	}
	for i, light := range lights {
		if !light.Enable {
			continue
		}
		lights[i].LoadChannels()
		c.lights[light.ID] = &lights[i]
		for _, ch := range light.Channels {
			c.c.Telemetry().CreateFeedIfNotExist(light.Name + "-" + ch.Name)
		}
	}
	return nil
}

func (c *Controller) On(id string, on bool) error {
	l, err := c.Get(id)
	if err != nil {
		return err
	}
	for pin, ch := range l.Channels {
		ch.On = on
		l.Channels[pin] = ch
	}
	return c.Update(id, l)
}
func (c *Controller) syncLights() {
	for _, light := range c.lights {
		if !light.Enable {
			continue
		}
		c.syncLight(light)
	}
}

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	switch depType {
	case storage.JackBucket:
		lights, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, l := range lights {
			if l.Jack == id {
				deps = append(deps, id)
			}
		}
		return deps, nil
	default:
		return deps, fmt.Errorf("unknown dep type:%s", depType)
	}
}
