package controller

import (
	"github.com/boltdb/bolt"
	pi "gobot.io/x/gobot/platforms/raspi"
	"gopkg.in/robfig/cron.v2"
	"log"
	"time"
)

type Controller struct {
	store      *Store
	conn       *pi.Adaptor
	cronRunner *cron.Cron
	cronIDs    map[string]cron.EntryID
	pwm        *PWM
}

func New() (*Controller, error) {
	db, err := bolt.Open("reefer.db", 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}
	/*
		config := PWMConfig{
			Bus:     1,
			Address: 0x40,
		}
		pwm := NewPWM(config)
	*/
	pwm := new(PWM)
	store := NewStore(db)
	conn := pi.NewAdaptor()
	c := &Controller{
		pwm:        pwm,
		store:      store,
		conn:       conn,
		cronRunner: cron.New(),
		cronIDs:    make(map[string]cron.EntryID),
	}
	return c, nil
}

func (c *Controller) Start() error {
	for _, bucket := range []string{"boards", "equipments", "jobs", "outlets", "uptime"} {
		if err := c.store.CreateBucket(bucket); err != nil {
			return nil
		}
	}
	//c.pwm.Start()
	c.cronRunner.Start()
	c.logStartTime()
	if err := c.loadAllJobs(); err != nil {
		return err
	}
	log.Println("Started Controller")
	return nil
}

func (c *Controller) Stop() error {
	c.cronRunner.Stop()
	//c.pwm.Stop()
	c.logStopTime()
	c.store.Close()
	log.Println("Stopped Controller")
	return nil
}
