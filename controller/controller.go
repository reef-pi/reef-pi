package controller

import (
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

type Controller struct {
	store     utils.Store
	config    Config
	state     *State
	telemetry *utils.Telemetry
}

func New(config Config) (*Controller, error) {
	store, err := utils.NewStore(config.Database)
	if err != nil {
		log.Println("Failed to create store. DB:", config.Database)
		return nil, err
	}
	telemetry := utils.NewTelemetry(config.AdafruitIO)
	c := &Controller{
		store:     store,
		state:     NewState(config, store, telemetry),
		config:    config,
		telemetry: telemetry,
	}
	return c, nil
}

func (c *Controller) CreateBuckets() error {
	buckets := []string{
		equipments.Bucket,
		timer.Bucket,
		lighting.Bucket,
		system.Bucket,
	}
	for _, bucket := range buckets {
		if err := c.store.CreateBucket(bucket); err != nil {
			return err
		}
	}
	return nil
}

func (c *Controller) Start() error {
	if err := c.CreateBuckets(); err != nil {
		return err
	}
	c.state.Bootup()
	err, r := SetupAPIServer(c.config.API)
	if err != nil {
		log.Fatal("ERROR:", err)
	}
	c.LoadAPI(r)
	log.Println("reef-pi is up and running")
	return nil
}

func (c *Controller) Stop() error {
	c.state.TearDown()
	c.store.Close()
	log.Println("reef-pi is shutting down")
	return nil
}
