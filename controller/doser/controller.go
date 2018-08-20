package doser

import (
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/types"
	"gopkg.in/robfig/cron.v2"
	"log"
	"sync"
)

type Controller struct {
	DevMode bool
	c       types.Controller
	mu      *sync.Mutex
	runner  *cron.Cron
	cronIDs map[string]cron.EntryID
	jacks   *connectors.Jacks
}

func New(devMode bool, c types.Controller, jacks *connectors.Jacks) (*Controller, error) {
	return &Controller{
		DevMode: devMode,
		jacks:   jacks,
		cronIDs: make(map[string]cron.EntryID),
		mu:      &sync.Mutex{},
		runner:  cron.New(),
		c:       c,
	}, nil
}

func (c *Controller) Start() {
	c.loadAllSchedule()
	c.runner.Start()
}

func (c *Controller) Stop() {
	c.runner.Stop()
	log.Println("Stopped dosing sub-system")
}

func (c *Controller) Setup() error {
	return c.c.Store().CreateBucket(Bucket)
}

func (c *Controller) loadAllSchedule() error {
	pumps, err := c.List()
	if err != nil {
		return err
	}
	for _, p := range pumps {
		if !p.Regiment.Enable {
			continue
		}
		c.addToCron(p)
	}
	return nil
}

func (c *Controller) addToCron(p Pump) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	cronID, err := c.runner.AddJob(p.Regiment.Schedule.CronSpec(), p.Runner(c.jacks))
	if err != nil {
		return err
	}
	log.Println("Successfully added cron entry. ID:", cronID)
	c.cronIDs[p.ID] = cronID
	return nil
}

func (c *Controller) On(id string, b bool) error {
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	p.Regiment.Enable = b
	return c.Update(id, p)
}
