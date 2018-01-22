package doser

import (
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
	vv        utils.VariableVoltage
}

func New(devMode bool, store utils.Store, t *utils.Telemetry) (*Controller, error) {
	var vv utils.VariableVoltage
	pwmConf := utils.DefaultPWMConfig
	pwmConf.DevMode = devMode
	pwm, err := utils.NewPWM(pwmConf)
	if err != nil {
		return nil, err
	}
	vv = pwm
	return &Controller{
		DevMode:   devMode,
		store:     store,
		vv:        vv,
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
		if !p.Schedule.Enable {
			continue
		}

	}
	return nil
}
