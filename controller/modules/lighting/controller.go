package lighting

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"log"
	"sync"
	"time"
)

const Bucket = storage.LightingBucket
const UsageBucket = storage.LightingUsageBucket

type Config struct {
	Interval time.Duration `json:"interval"`
}

var DefaultConfig = Config{
	Interval: 15 * time.Second,
}

type Controller struct {
	sync.Mutex
	jacks    *connectors.Jacks
	config   Config
	c        controller.Controller
	quitters map[string]chan struct{}
	statsMgr telemetry.StatsManager
}

func New(conf Config, c controller.Controller) (*Controller, error) {
	return &Controller{
		Mutex:    sync.Mutex{},
		c:        c,
		jacks:    c.DM().Jacks(),
		config:   conf,
		quitters: make(map[string]chan struct{}),
		statsMgr: c.Telemetry().NewStatsManager(UsageBucket),
	}, nil
}

func (c *Controller) Start() {
	c.Lock()
	defer c.Unlock()
	lights, err := c.List()
	if err != nil {
		log.Println("ERROR: light subsystem: Failed to list lights. Error:", err)
		return
	}
	for _, l := range lights {
		if !l.Enable {
			continue
		}
		fn := func(d json.RawMessage) interface{} {
			u := Usage{}
			json.Unmarshal(d, &u)
			return u
		}
		if err := c.statsMgr.Load(l.ID, fn); err != nil {
			log.Println("ERROR: lighting subsystem. Failed to load usage. Error:", err)
		}
		quit := make(chan struct{})
		c.quitters[l.ID] = quit
		go c.Run(l, quit)
	}
}

func (c *Controller) Stop() {
	c.Lock()
	defer c.Unlock()
	for id, quit := range c.quitters {
		close(quit)
		delete(c.quitters, id)
	}
	log.Println("Stopped lighting subsystem")
}

func (c *Controller) Setup() error {
	c.Lock()
	defer c.Unlock()
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	return c.c.Store().CreateBucket(UsageBucket)
}

func (c *Controller) On(id string, on bool) error {
	l, err := c.Get(id)
	if err != nil {
		return err
	}
	l.Enable = on
	return c.Update(id, l)
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
