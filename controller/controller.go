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
	adc        *ADC
	enablePWM  bool
	enableADC  bool
}

func New(enablePWM, enableADC bool) (*Controller, error) {
	db, err := bolt.Open("reefer.db", 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}

	var pwm *PWM
	var adc *ADC
	if enablePWM {
		pwm = NewPWM()
	}
	if enableADC {
		adc = NewADC()
	}
	store := NewStore(db)
	conn := pi.NewAdaptor()
	c := &Controller{
		adc:        adc,
		pwm:        pwm,
		enablePWM:  enablePWM,
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
	if c.enablePWM {
		c.pwm.Start()
	}
	if c.enableADC {
		c.adc.Start()
	}
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
	if c.enablePWM {
		c.pwm.Stop()
	}
	if c.enableADC {
		c.adc.Stop()
	}
	c.logStopTime()
	c.store.Close()
	log.Println("Stopped Controller")
	return nil
}
