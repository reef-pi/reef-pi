package doser

import (
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
)

type Controller struct {
	DevMode   bool
	store     utils.Store
	telemetry *utils.Telemetry
	mu        *sync.Mutex
	stopCh    chan struct{}
}

func New(devMode bool, store utils.Store, t *utils.Telemetry, eqs *equipments.Controller) (*Controller, error) {
	return &Controller{
		DevMode:   devMode,
		store:     store,
		telemetry: t,
		mu:        &sync.Mutex{},
		stopCh:    make(chan struct{}),
	}, nil
}

func (c *Controller) Start() {
	go c.StartDoser()
}
func (c *Controller) Stop() {
	c.stopCh <- struct{}{}
	log.Println("Stopped dosing sub-system")
}
func (c *Controller) Setup() error {
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return nil
}

func (c *Controller) StartDoser() {
	log.Println("Starting dosing sub-system")
	for {
		select {
		case <-c.stopCh:
			return
		}
	}
}
