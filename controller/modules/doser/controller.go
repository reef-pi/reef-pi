package doser

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const (
	Bucket          = storage.DoserBucket
	UsageBucket     = storage.DoserUsageBucket
	_cronParserSpec = cron.Second | cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow | cron.Descriptor
)

type Controller struct {
	DevMode  bool
	statsMgr telemetry.StatsManager
	c        controller.Controller
	mu       *sync.Mutex
	runner   *cron.Cron
	cronIDs  map[string]cron.EntryID
}

func New(devMode bool, c controller.Controller) (*Controller, error) {
	return &Controller{
		DevMode:  devMode,
		cronIDs:  make(map[string]cron.EntryID),
		mu:       &sync.Mutex{},
		runner:   cron.New(cron.WithParser(cron.NewParser(_cronParserSpec))),
		statsMgr: c.Telemetry().NewStatsManager(UsageBucket),
		c:        c,
	}, nil
}
func (c *Controller) GetEntity(id string) (controller.Entity, error) {
	return nil, fmt.Errorf("doser subsystem does not support 'GetEntity' interface")
}

func (c *Controller) Stop() {
	c.runner.Stop()
	log.Println("Stopped dosing sub-system")
}

func (c *Controller) Setup() error {
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	return c.c.Store().CreateBucket(UsageBucket)
}

func (c *Controller) Start() {
	pumps, err := c.List()
	if err != nil {
		log.Println("ERROR: Doser subsystem: Failed to list pumps. Error: ", err)
		return
	}
	for _, p := range pumps {
		if !p.Regiment.Enable {
			continue
		}
		c.addToCron(p)
		fn := func(d json.RawMessage) interface{} {
			u := Usage{}
			json.Unmarshal(d, &u)
			return u
		}
		if err := c.statsMgr.Load(p.ID, fn); err != nil {
			log.Println("ERROR: dosing controller. Failed to load usage. Error:", err)
		}
	}
	c.runner.Start()
	return
}

func (c *Controller) addToCron(p Pump) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	cronID, err := c.runner.AddJob(
		p.Regiment.Schedule.CronSpec(),
		p.Runner(c.c.DM(), c.c.Telemetry(), c.statsMgr),
	)
	if err != nil {
		return err
	}
	log.Println("doser-subsystem: Successfully added cron entry. ID:", cronID)
	c.cronIDs[p.ID] = cronID
	return nil
}

func (c *Controller) On(id string, b bool) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	if p.Regiment.Enable {
		return errors.New("enabled doser can not be On/Off -ed")
	}
	log.Println("doser-subsystem: Switching doser :", p.Name, "to", b)
	v := make(map[int]float64)
	v[p.Pin] = 0
	if b {
		v[p.Pin] = p.Regiment.Speed
	}
	return c.c.DM().Jacks().Control(p.Jack, v)
}

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	switch depType {
	case storage.JackBucket:
		ds, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, d := range ds {
			if d.Jack == id {
				deps = append(deps, id)
			}
		}
		return deps, nil
	default:
		return deps, fmt.Errorf("unknown deptype:%s", depType)
	}
}
