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
	DevMode           bool
	statsMgr          telemetry.StatsManager
	c                 controller.Controller
	repo              repository
	mu                *sync.Mutex
	runner            *cron.Cron
	cronIDs           map[string]cron.EntryID
	quitters          map[string]*continuousRun // for continuous pumps
	continuousMu      sync.Mutex                // serializes lifecycle changes; workers never acquire it
	continuousControl func(string, map[int]float64) error
}

type continuousRun struct {
	quit chan struct{}
	done chan struct{}
}

func New(devMode bool, c controller.Controller) (*Controller, error) {
	return &Controller{
		DevMode:  devMode,
		cronIDs:  make(map[string]cron.EntryID),
		quitters: make(map[string]*continuousRun),
		mu:       &sync.Mutex{},
		runner:   cron.New(cron.WithParser(cron.NewParser(_cronParserSpec))),
		statsMgr: c.Telemetry().NewStatsManager(UsageBucket),
		c:        c,
		repo:     newRepository(c.Store()),
	}, nil
}
func (c *Controller) GetEntity(id string) (controller.Entity, error) {
	return nil, fmt.Errorf("doser subsystem does not support 'GetEntity' interface")
}

func (c *Controller) Stop() {
	<-c.runner.Stop().Done()
	c.continuousMu.Lock()
	c.mu.Lock()
	runs := make([]*continuousRun, 0, len(c.quitters))
	for id, run := range c.quitters {
		runs = append(runs, run)
		delete(c.quitters, id)
	}
	c.mu.Unlock()
	for _, run := range runs {
		close(run.quit)
	}
	for _, run := range runs {
		<-run.done
	}
	c.continuousMu.Unlock()
	log.Println("Stopped dosing subsystem")
}

func (c *Controller) Setup() error {
	return c.repo.Setup()
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
		if p.Regiment.Continuous {
			c.startContinuous(p)
		} else {
			c.addToCron(p)
		}
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

func (c *Controller) startContinuous(p Pump) {
	c.replaceContinuous(p.ID, &p)
}

// replaceContinuous fully joins the prior worker before making a replacement
// visible or allowing it to write to the same output.
func (c *Controller) replaceContinuous(id string, p *Pump) {
	c.continuousMu.Lock()
	defer c.continuousMu.Unlock()
	c.mu.Lock()
	previous := c.quitters[id]
	delete(c.quitters, id)
	c.mu.Unlock()
	if previous != nil {
		close(previous.quit)
		<-previous.done
	}
	if p == nil {
		return
	}
	run := &continuousRun{quit: make(chan struct{}), done: make(chan struct{})}
	c.mu.Lock()
	c.quitters[id] = run
	c.mu.Unlock()
	go func() {
		defer close(run.done)
		log.Println("doser-subsystem: starting continuous pump:", p.Name, "at", p.Regiment.Speed, "%")
		v := map[int]float64{p.Pin: p.Regiment.Speed}
		if err := c.controlContinuous(p.Jack, v); err != nil {
			log.Println("ERROR: doser-subsystem: failed to start continuous pump:", p.Name, "error:", err)
			return
		}
		<-run.quit
		v[p.Pin] = 0
		if err := c.controlContinuous(p.Jack, v); err != nil {
			log.Println("ERROR: doser-subsystem: failed to stop continuous pump:", p.Name, "error:", err)
		}
		log.Println("doser-subsystem: stopped continuous pump:", p.Name)
	}()
}

func (c *Controller) controlContinuous(jack string, values map[int]float64) error {
	if c.continuousControl != nil {
		return c.continuousControl(jack, values)
	}
	return c.c.DM().Jacks().Control(jack, values)
}

func (c *Controller) stopContinuous(id string) {
	c.replaceContinuous(id, nil)
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
		return errors.New("enabled doser cannot be On/Off -ed")
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
