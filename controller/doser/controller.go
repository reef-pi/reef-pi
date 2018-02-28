package doser

import (
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
	"gopkg.in/robfig/cron.v2"
	"log"
	"sync"
)

type Controller struct {
	DevMode   bool
	store     utils.Store
	telemetry *utils.Telemetry
	mu        *sync.Mutex
	runner    *cron.Cron
	cronIDs   map[string]cron.EntryID
	jacks     *connectors.Jacks
}

func New(devMode bool, store utils.Store, jacks *connectors.Jacks, t *utils.Telemetry) (*Controller, error) {
	return &Controller{
		DevMode:   devMode,
		store:     store,
		jacks:     jacks,
		cronIDs:   make(map[string]cron.EntryID),
		telemetry: t,
		mu:        &sync.Mutex{},
		runner:    cron.New(),
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
	return c.store.CreateBucket(Bucket)
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
